import { InjectFlowProducer, InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { FlowProducer, Job } from 'bullmq';
import { FLOW_PRODUCER_NAME, QUEUE_NAME } from './payment-tracker.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import _ from 'lodash';
import { SuperTokenAccountingService } from 'src/super-token-accounting/super-token-accounting.service';
import { StripeToSuperfluidService } from 'src/stripe-to-superfluid/stripe-to-superfluid.service';
import { DEFAULT_PAGING } from 'src/stripeModuleConfig';
import { SubscriptionMetadata } from 'src/checkout-session/checkout-session.processer';
import { getAddress } from 'viem';

export const PAYMENT_TRACKER_JOB_NAME = 'verify-customer-invoice-payments-by-super-token';

type PaymentTrackerJob = Job<
  {
    stripeCustomerId: string;
  },
  any,
  typeof PAYMENT_TRACKER_JOB_NAME
>;

type TRACKED_INVOICE_GROUP_KEY = `${number}:0x${string}:0x${string}:0x${string}`;
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
    if (!customer) {
      throw new Error('Customer not found. Confused...');
    }

    const invoices = await this.stripeClient.invoices
      .list({
        collection_method: 'send_invoice',
        customer: customer.id,
        status: 'open',
        expand: ['data.subscription'],
      })
      .autoPagingToArray(DEFAULT_PAGING);

    // TODO: Warn if there are subscriptions without the token address?
    const groupBySuperToken = _.groupBy(invoices, (x) => {
      const subscriptionMetadata = x.subscription_details?.metadata as
        | Partial<SubscriptionMetadata>
        | undefined;
      if (subscriptionMetadata) {
        const { chainId, superTokenAddress, senderAddress, receiverAddress } = subscriptionMetadata;
        if (chainId && superTokenAddress && senderAddress && receiverAddress) {
          // TODO: validate more strictly?
          const groupKey: TRACKED_INVOICE_GROUP_KEY = `${chainId}:${superTokenAddress}:${senderAddress}:${receiverAddress}`;
          return groupKey;
        }
      }

      return NOT_TRACKED_INVOICE_GROUP_KEY; // We don't know what to do with these.
    });

    for (const [key, invoices_] of Object.entries(groupBySuperToken)) {
      if (key === NOT_TRACKED_INVOICE_GROUP_KEY) {
        // TODO: Warn? Return from job as statistics?
      } else {
        const { totalAmountPaid, totalAmountDue } = invoices_.reduce(
          (accumulator, invoice) => ({
            totalAmountPaid: accumulator.totalAmountPaid + BigInt(invoice.amount_paid),
            totalAmountDue: accumulator.totalAmountDue + BigInt(invoice.amount_due),
          }),
          {
            totalAmountPaid: 0n,
            totalAmountDue: 0n,
          },
        );

        const keySplit = key.split(':');

        const chainId = Number(keySplit[0]);
        const superTokenAddress = keySplit[1];
        const senderAddress = keySplit[2];
        const receiverAddress = keySplit[3];

        const totalAmountTransferred =
          await this.superTokenAccountingService.getAccountToAccountBalance({
            chainId,
            superTokenAddress,
            senderAddress,
            receiverAddress,
          });

        if (totalAmountPaid > totalAmountTransferred) {
          throw new Error(
            "This would mean we're missing data most likely... There could be some refund scenarios?",
          );
        }

        const leftOverToDisburse = totalAmountTransferred - totalAmountPaid;
        if (leftOverToDisburse > totalAmountDue) {
          for (const invoice in invoices_) {
            await this.stripeClient.invoices.pay(invoice); // It's not too bad if this fails as there will be a retry of the job which will get fresh info.
          }
        } else {
          throw new Error('Not enough funds transferred...');
        }

        // TODO(KK): Do we double-check with "superTokenAccountingService" here that super token and currency match?
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
