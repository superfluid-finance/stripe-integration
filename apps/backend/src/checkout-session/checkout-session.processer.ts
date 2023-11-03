import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { AddressSchema, CreateSessionData } from './checkout-session.controller';
import { SuperfluidStripeConverterService } from 'src/superfluid-stripe-converter/superfluid-stripe-converter.service';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import { z } from 'zod';
import { SECONDS_IN_A_DAY, mapTimePeriodToSeconds } from './time-period';

export const CHECKOUT_SESSION_JOB_NAME = 'checkout-session';

type Address = string;
type CustomerId = string;
type CheckoutSessionJob = Job<CreateSessionData, void, typeof CHECKOUT_SESSION_JOB_NAME>;

type SuperfluidNamespace<T> = {
  [P in keyof T as `superfluid_${string & P}`]: T[P];
};

/**
 * This should be stored on Stripe.Subscription.
 */
export type SuperfluidStripeSubscriptionsMetadata = SuperfluidNamespace<{
  NOTE?: string;
  chain_id: number;
  token_address: Address;
  sender_address: Address;
  receiver_address: Address;
  require_upfront_transfer: string;
  // TODO(KK): Any value in storing flow rate here?
}>;

export const SuperfluidStripeSubscriptionsMetadataSchema: z.ZodType<SuperfluidStripeSubscriptionsMetadata> =
  z
    .object({
      superfluid_NOTE: z.string().optional(),
      superfluid_chain_id: z.number(),
      superfluid_token_address: AddressSchema,
      superfluid_sender_address: AddressSchema,
      superfluid_receiver_address: AddressSchema,
      superfluid_require_upfront_transfer: z.string().toLowerCase().pipe(z.literal("true").or(z.literal("false")))
    })
    .strip();

export type SuperfluidStripeCustomerMetadata = SuperfluidNamespace<{
  NOTE?: string;
}>;

/**
 * What is this? This handles the job of creating a new Stripe customer and subscription.
 * The complexity of this task comes from the fact that we don't want to accidentally miss any customers,
 * we also don't want to create spam on Stripe,
 * and we want to be swift for the users that go through the whole flow and do become customers.
 *
 * Why not handle this with a blocking step in the UI? Too many error possibilities.
 * It's perfectly possible for the user to send a transaction and not see the final success screen of the widget.
 * Or for the transaction to fail on-chain and for the user to end the session.
 */
@Processor(QUEUE_NAME)
export class CheckoutSessionProcesser extends WorkerHost {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly converterService: SuperfluidStripeConverterService,
  ) {
    super();
  }

  async process(
    job: CheckoutSessionJob,
    token?: string,
  ): Promise<CheckoutSessionJob['returnvalue']> {
    const data = job.data;

    const currency = await this.converterService.mapSuperTokenToStripeCurrency({
      chainId: data.chainId,
      address: data.superTokenAddress,
    });

    if (!currency) {
      throw new Error(
        `The Super Token is not mapped to any Stripe Currency. It does not make sense to handle this job without that mapping. Please fix the mapping! Chain ID: ${data.chainId}, Super Token: [${data.superTokenAddress}]`,
      );
    }

    const product = await this.stripeClient.products.retrieve(data.productId);
    if (!product) {
      throw new Error(
        `Product not found. What are you subscribing to? Product ID: [${data.productId}]`,
      );
    }

    const prices = await this.stripeClient.prices
      .list({
        active: true,
        product: product.id,
        currency: currency,
      })
      .autoPagingToArray(DEFAULT_PAGING);
    if (prices.length > 1) {
      throw new Error(
        'The Stripe-Superfluid Integration does not know how to handle more than one price for the currency... Please reduce to a single price on Stripe. Or take contact for an added feature.',
      );
    }
    if (prices.length === 0) {
      throw new Error(
        `No price on Stripe found for the product and the currency. Currency: [${currency}], Product ID: [${product.id}]`,
      );
    }
    const price = prices[0];

    const customers = await this.stripeClient.customers
      .list({
        email: data.email,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    let customerId: CustomerId;
    if (customers.length === 0) {
      // Create customer if it doesn't exist? Probably don't do it too eagerly without first receiving some payment on the block-chain?
      // A solution could be to create the Stripe Customer eagerly but then create a job that would delete stale Customers after some time that didn't follow throuwgh with their Subscription.
      // Or have it more blocking in the UI so that spam wouldn't as easily be created?
      const customerMetadata: SuperfluidStripeCustomerMetadata = {
        superfluid_NOTE: 'This user was auto-generated.',
      };

      const customerCreateParams: Stripe.CustomerCreateParams = {
        email: data.email,
        metadata: customerMetadata,
      };

      const customersCreateResponse =
        await this.stripeClient.customers.create(customerCreateParams);
      customerId = customersCreateResponse.id;
    } else if (customers.length === 1) {
      customerId = customers[0].id;
    } else {
      throw new Error(
        `There is more than one Stripe Customer in the system with the given e-mail. E-mail: [${data.email}] Please contact support for guidance on how to handle this situation.`,
      );
    }

    const requireUpfrontTransfer = false; // TODO(KK): Solve this when Super Token transfer accounting introduced to accounting API

    const subscriptionMetadata: SuperfluidStripeSubscriptionsMetadata = {
      superfluid_NOTE: 'Auto-generated. Please be careful when editing!',
      superfluid_chain_id: data.chainId,
      superfluid_token_address: data.superTokenAddress as Address,
      superfluid_sender_address: data.senderAddress as Address,
      superfluid_receiver_address: data.receiverAddress as Address,
      superfluid_require_upfront_transfer: requireUpfrontTransfer.toString() 
    };

    // Note that we are creating a Stripe Subscription here that will send invoices and e-mails to the user.
    // There could be scenarios where someone was using the checkout widget to pay for an existing subscription.
    // Then we wouldn't want to create a new subscription here...
    const daysUntilDue = requireUpfrontTransfer ? 0 : mapTimePeriodToSeconds(price.recurring!.interval) / SECONDS_IN_A_DAY
    const subscriptionsCreateParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      collection_method: 'send_invoice',
      // Note that there is also 1 hour "draft" period.
      // Sending an invoice to the user straight away is likely not preferrable for A LOT of scenarios.
      // Consider a better solution or an environment variable here!
      days_until_due: Number(daysUntilDue),
      currency: currency,
      items: [
        {
          price: price.id,
          // This most of the time should be 1 for expected use-cases.
          // There definitely are real-life scenarios where the quantity could be more than 1.
          // The handling of that is not prioritized yet.
          // The handling of that solution should start from the checkout widget's configuration.
          quantity: 1,
        },
      ],
      metadata: subscriptionMetadata,
    };
    
    const subscriptionsCreateResponse =
      await this.stripeClient.subscriptions.create(subscriptionsCreateParams);

    // Call Stripe Listener Module to get invoice processing right away?
  }

  // TODO! Fire off a "delete user after 24 hours without any on-chain streams" type of a job here?
}

const logger = new Logger(CheckoutSessionProcesser.name);
