import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { AddressSchema, CreateSessionData } from './checkout-session.controller';
import { StripeToSuperfluidService } from 'src/stripe-to-superfluid/stripe-to-superfluid.service';
import { DEFAULT_PAGING } from 'src/stripeModuleConfig';
import { z } from 'zod';

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
  chain_id: number;
  token_address: Address;
  sender_address: Address;
  receiver_address: Address;
  // TODO(KK): Any value in storing flow rate here?
}>;

export const SuperfluidStripeSubscriptionsMetadataSchema: z.ZodType<SuperfluidStripeSubscriptionsMetadata> =
  z
    .object({
      superfluid_chain_id: z.number(),
      superfluid_token_address: AddressSchema,
      superfluid_sender_address: AddressSchema,
      superfluid_receiver_address: AddressSchema,
    })
    .strip();

/**
 *
 */
@Processor(QUEUE_NAME)
export class CheckoutSessionProcesser extends WorkerHost {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly stripeToSupefluidService: StripeToSuperfluidService, // Bad name...
  ) {
    super();
  }

  async process(
    job: CheckoutSessionJob,
    token?: string,
  ): Promise<CheckoutSessionJob['returnvalue']> {
    const data = job.data;

    const currency = this.stripeToSupefluidService.mapSuperTokenToStripeCurrency({
      chainId: data.chainId,
      address: data.superTokenAddress,
    });

    if (!currency) {
      throw new Error('How to handle this?');
    }

    const product = await this.stripeClient.products.retrieve(data.productId);
    if (!product) {
      // if not found, probably fail the job
      throw new Error('Product not found. What are you subscribing to?');
    }

    const prices = await this.stripeClient.prices
      .list({
        active: true,
        product: product.id,
        currency: currency,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    if (prices.length > 1) {
      throw new Error("More than one price for the currency. It's throwing me off...");
    }

    if (prices.length === 0) {
      throw new Error('No Stripe price found for the Super Token.');
    }

    const price = prices[0];

    const customers = await this.stripeClient.customers
      .list({
        email: data.email,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    let customerId: CustomerId;
    if (customers.length === 0) {
      // create customer if it doesn't exist? Probably don't do it too eagerly without first receiving some payment.

      const customerCreateParams: Stripe.CustomerCreateParams = {
        email: data.email,
        // Anything to put into the metadata?
      };

      const customersCreateResponse = await this.stripeClient.customers.create(
        customerCreateParams,
      );
      customerId = customersCreateResponse.id;
    } else {
      // What if there's more than one?
      customerId = customers[0].id;
    }

    // TODO(KK): Add a note of caution to the metadata not to edit the Superfluid fields?
    const subscriptionMetadata: SuperfluidStripeSubscriptionsMetadata = {
      superfluid_chain_id: data.chainId,
      superfluid_token_address: data.superTokenAddress as Address,
      superfluid_sender_address: data.senderAddress as Address,
      superfluid_receiver_address: data.receiverAddress as Address,
    };

    const subscriptionsCreateParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 0, // TODO(KK): I'm not sure about this value... Note that there is also 1 hour "draft" period.
      currency: currency,
      items: [
        {
          price: price.id,
          quantity: 1, // KK: This should be fine. In what cases wouldn't it be 1?
        },
      ],
      metadata: subscriptionMetadata,
    };

    const subscriptionsCreateResponse = await this.stripeClient.subscriptions.create(
      subscriptionsCreateParams,
    );

    // Handle job for ensuring customer on Stripe's end here
    // Have the job be self-scheduling, i.e. it reschedules for a while until it dies off if user didn't finish with the details

    // Call Stripe Listener Module to get invoice processing right away?
  }
}

const logger = new Logger(CheckoutSessionProcesser.name);
