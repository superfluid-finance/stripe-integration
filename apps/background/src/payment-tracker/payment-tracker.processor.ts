import { InjectFlowProducer, InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { FlowProducer, Job } from 'bullmq';
import { FLOW_PRODUCER_NAME, QUEUE_NAME } from './payment-tracker.queue';
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
import stringify from 'fast-json-stable-stringify';

export const PAYMENT_TRACKER_JOB_NAME = 'verify-customer-invoice-payments-by-super-token';

type PaymentTrackerJob = Job<
  {
    stripeCustomerId: string;
  },
  any,
  typeof PAYMENT_TRACKER_JOB_NAME
>;

type TRACKED_INVOICE_GROUP_KEY = `${number}:${string}:${string}:${string}`;
const NOT_TRACKED_INVOICE_GROUP_KEY = null;

/**
 *
 */
@Processor(QUEUE_NAME)
export class PaymentTrackerProcessor extends WorkerHost {
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

  async process(job: PaymentTrackerJob, token?: string): Promise<void> {
    const customer = await this.stripeClient.customers.retrieve(job.data.stripeCustomerId);
    // Is stripe already ensuring the customer exists? Should I check for .deleted?
    if (!customer) {
      throw new Error('Customer does not exist.');
    }

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
        const { totalAmountPaid, totalAmountDue } = invoices.reduce(
          (accumulator, invoice) => {
            // This is not perfectly correct.
            return {
              totalAmountPaid: accumulator.totalAmountPaid + BigInt(invoice.amount_paid),
              totalAmountDue: accumulator.totalAmountDue + BigInt(invoice.amount_due),
            };
          },
          {
            totalAmountPaid: 0n,
            totalAmountDue: 0n,
          },
        );

        const metadata = JSON.parse(metadataAsString) as SuperfluidStripeSubscriptionsMetadata;

        const totalAmountTransferred =
          await this.superTokenAccountingService.getAccountToAccountBalance({
            chainId: metadata.superfluid_chain_id,
            superTokenAddress: metadata.superfluid_token_address,
            senderAddress: metadata.superfluid_sender_address,
            receiverAddress: metadata.superfluid_receiver_address,
          });

        if (totalAmountPaid > totalAmountTransferred) {
          throw new Error(
            "This would mean we're missing data most likely... There could be some refund scenarios?",
          );
        }

        const leftOverToDisburse = totalAmountTransferred - totalAmountPaid;
        if (leftOverToDisburse > totalAmountDue) {
          for (const invoice of invoices) {
            const updatedInvoice = await this.stripeClient.invoices.update(invoice.id, {
              metadata,
            });
            await this.stripeClient.invoices.pay(updatedInvoice.id, { paid_out_of_band: true });
            // Note, we can't do update of metadata and marking as paid atomically, i.e. needs to be 2 HTTP calls.

            // It's not too bad if this fails as there will be a retry of the job which will get fresh info.
          }
        } else {
          throw new Error('Not enough funds transferred...');
        }

        // TODO(KK): Do we double-check with "superTokenAccountingService" here that super token and currency match? Because the config might have changed? I don't love it as it should probably be grandfather in with the previous token.
      }
    }

    // this.flowProducer.add({
    //   name: PAYMENT_TRACKER_JOB_NAME,
    //   queueName: QUEUE_NAME,
    //   children: {

    //   }
    // })

    // Decide how to handle different tokens?
    // Decide if FlowProducer should be used per Customer?
    // Decide if should split anything based on receiver address?

    // Create FIFO strategy for dispersing payments
    // How to track used up payments?
  }
}
