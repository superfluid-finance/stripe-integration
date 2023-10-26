import { InjectFlowProducer, InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { FlowProducer, Job } from 'bullmq';
import { FLOW_PRODUCER_NAME, QUEUE_NAME } from './payment-verification.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import _ from 'lodash';
import { SuperTokenAccountingService } from 'src/super-token-accounting/super-token-accounting.service';
import { StripeToSuperfluidService } from 'src/stripe-to-superfluid/stripe-to-superfluid.service';
import { DEFAULT_PAGING } from 'src/stripeModuleConfig';
import {
  SuperfluidStripeSubscriptionsMetadata,
  SuperfluidStripeSubscriptionsMetadataSchema,
} from 'src/checkout-session/checkout-session.processer';
import stringify from 'safe-stable-stringify';
import { currencyDecimalMapping } from 'src/currencies';
import { formatUnits } from 'viem';

export const PAYMENT_VERIFICATION_JOB_NAME = 'verify-customer-invoice-payments-by-super-token';

type PaymentVerificationJob = Job<
  {
    stripeCustomerId: string;
  },
  any,
  typeof PAYMENT_VERIFICATION_JOB_NAME
>;

type TRACKED_INVOICE_GROUP_KEY = `${number}:${string}:${string}:${string}`;
const NOT_TRACKED_INVOICE_GROUP_KEY = null;

/**
 *
 */
@Processor(QUEUE_NAME)
export class PaymentVerificationProcessor extends WorkerHost {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue,
    @InjectFlowProducer(FLOW_PRODUCER_NAME)
    private readonly flowProducer: FlowProducer,
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly stripeToSuperfluidService: StripeToSuperfluidService,
    private readonly superTokenAccountingService: SuperTokenAccountingService,
  ) {
    super();
  }

  async process(job: PaymentVerificationJob, token?: string): Promise<void> {
    const customer = await this.stripeClient.customers.retrieve(job.data.stripeCustomerId);
    // Is stripe already ensuring the customer exists? Should I check for .deleted?
    if (!customer) {
      throw new Error('Customer does not exist.');
    }

    // TODO: Fetching subscriptions is not actually necessary?
    // const subscriptions = await this.stripeClient.subscriptions.list({
    //   collection_method: "send_invoice",
    //   customer: customer.id,
    //   expand: []
    // }).autoPagingToArray(DEFAULT_PAGING);

    const customerInvoices = await this.stripeClient.invoices
      .list({
        collection_method: 'send_invoice',
        customer: customer.id,
        expand: ['data.subscription'],
      })
      .autoPagingToArray(DEFAULT_PAGING);

    // TODO: Warn if there are subscriptions without the token address?

    const invoicesGroupedBySubscriptionMetadata = _.groupBy(customerInvoices, (x) => {
      const rawMetadata = x.subscription_details?.metadata as
        | Partial<SuperfluidStripeSubscriptionsMetadata>
        | undefined;

      const metadata = SuperfluidStripeSubscriptionsMetadataSchema.safeParse(rawMetadata);
      if (metadata.success) {
        return stringify(metadata.data); // Note: extra keys should have already been stripped by Zod.
      }

      return NOT_TRACKED_INVOICE_GROUP_KEY; // We don't know what to do with these.
    });

    for (const [metadataAsString, invoices] of Object.entries(
      invoicesGroupedBySubscriptionMetadata,
    )) {
      if (metadataAsString === NOT_TRACKED_INVOICE_GROUP_KEY) {
        // TODO: Warn? Return from job as statistics? Log how many were there?
      } else {
        const metadata = JSON.parse(metadataAsString) as SuperfluidStripeSubscriptionsMetadata;

        const uniqueCurrencies = _.uniqBy(invoices, (x) => x.currency).map((i) => i.currency);
        if (uniqueCurrencies.length !== 1) {
          throw new Error(
            `There is some confusion with the Stripe currencies and their Super Token mappings -- more than one Stripe currency has been mapped to a Super Token. Currencies: [${uniqueCurrencies.join(
              ',',
            )}], Chain ID: [${metadata.superfluid_chain_id}], Super Token: [${
              metadata.superfluid_token_address
            }]`,
          );
        }
        const currency = uniqueCurrencies[0]!;
        const currencyDecimals = currencyDecimalMapping.get(currency.toUpperCase());
        if (typeof currencyDecimals === 'undefined') {
          throw new Error(
            `The currency Stripe currency to Super Token mapping is not properly configured. Currency: ${currency}`,
          );
        }

        // The Stripe currency to wei conversion is needed to account for on-chain transfers and Stripe payments on the same denominator.
        // Note that Stripe currency values are already in "units". Most common being 2 decimals.
        const multitudeNeededForWei = BigInt(18 - currencyDecimals); // Super Tokens are always 18 decimals!
        const { totalAmountPaidWei: totalPaid, totalAmountDueWei: totalDue } = invoices.reduce(
          // Ensure currency is always the same.
          (accumulator, invoice) => {
            return {
              totalAmountPaidWei:
                accumulator.totalAmountPaidWei +
                BigInt(invoice.amount_paid) * multitudeNeededForWei,
              totalAmountDueWei:
                accumulator.totalAmountDueWei + BigInt(invoice.amount_due) * multitudeNeededForWei,
            };
          },
          {
            totalAmountPaidWei: 0n,
            totalAmountDueWei: 0n,
          },
        );

        const totalSentOnChain = await this.superTokenAccountingService.getAccountToAccountBalance({
          chainId: metadata.superfluid_chain_id,
          superTokenAddress: metadata.superfluid_token_address,
          senderAddress: metadata.superfluid_sender_address,
          receiverAddress: metadata.superfluid_receiver_address,
        });

        if (totalPaid > totalSentOnChain) {
          throw new Error(
            `There's more marked as paid than we have on record how much was transferred on-chain. Was there a refund?
            Chain ID: [${metadata.superfluid_chain_id}], Super Token: [${metadata.superfluid_token_address}], Sender Address: [${metadata.superfluid_sender_address}], Receiver Address: [${metadata.superfluid_receiver_address}]`,
          );
        }

        const totalDueOnChain = totalDue - totalSentOnChain;
        if (totalDueOnChain < 0) {
          // This means that there's more sent on-chain than was billed. The extra funds will be used for the next invoice.
        }

        const leftToUseForOpenInvoices = totalSentOnChain - totalPaid;

        if (leftToUseForOpenInvoices > totalDue) {
          // Mark invoices paid in chronological order based on dude date.

          const openInvoices = invoices.filter((x) => x.status === 'open');
          const openInvoicesOrdered = _.orderBy(openInvoices, (x) => x.amount_due, 'asc');

          for (const invoice of openInvoicesOrdered) {
            await this.stripeClient.invoices.update(invoice.id, {
              metadata,
            });
            await this.stripeClient.invoices.pay(invoice.id, { paid_out_of_band: true });
            // Note, we can't do update of metadata and marking as paid atomically, i.e. needs to be 2 HTTP calls.

            // It's not too bad if this fails as there will be a retry of the job which will get fresh info.
          }
        } else {
          // This is not ideal because one invoice failure will stop the whole loop. This could be decently common too...
          throw new Error(
            `Not enough on-chain transfers to mark any invoice as paid. Total due: ${formatUnits(
              totalDue,
              currencyDecimals,
            )} ${currency}`,
          );
        }
      }
    }
  }
}
