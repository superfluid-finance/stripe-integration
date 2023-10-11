import { InjectFlowProducer, InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { FlowProducer, Job } from 'bullmq';
import { FLOW_PRODUCER_NAME, QUEUE_NAME } from './payment-tracker.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import _ from 'lodash';
import { SuperTokenAccountingService } from 'src/super-token-accounting/super-token-accounting.service';
import { StripeToSuperfluidService } from 'src/stripe-to-superfluid/stripe-to-superfluid.service';
import { DEFAULT_PAGING } from 'src/stripeModuleConfig';

export const PAYMENT_TRACKER_JOB_NAME = 'verify-customer-invoice-payments-by-super-token';

type PaymentTrackerJob = Job<
  {
    stripeCustomerId: string;
  },
  any,
  typeof PAYMENT_TRACKER_JOB_NAME
>;

/**
 *
 */
@Processor(QUEUE_NAME)
export class PaymentTrackerProcessor extends WorkerHost {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue,
    @InjectFlowProducer(FLOW_PRODUCER_NAME) private readonly flowProducer: FlowProducer,
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly stripeToSuperfluidService: StripeToSuperfluidService,
    private readonly superTokenAccountingService: SuperTokenAccountingService
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
        expand: ["data.subscription"]
      })
      .autoPagingToArray(DEFAULT_PAGING);

    // TODO: Group by Super Token!
      
    // TODO: Warn if there are subscriptions without the token address?
    const groupByCurrencies = _.groupBy(invoices, (x) => x.subscription_details?.metadata?.["tokenAddress"]);
    _.forEach(groupByCurrencies, (invoices_, key) => {
      const { totalAmountPaid, totalAmountDue } = invoices_.reduce((accumulator, invoice) => ({
        totalAmountPaid: accumulator.totalAmountPaid + BigInt(invoice.amount_paid),
        totalAmountDue: accumulator.totalAmountDue + BigInt(invoice.amount_due)
      }), {
        totalAmountPaid: 0n,
        totalAmountDue: 0n
      } as {
        totalAmountPaid: bigint
        totalAmountDue: bigint
      });

      // TODO: This should already be somewhere in the metadata for optimization, i.e. there shouldn't be a need to map again.

      // const superTokenAddress = this.stripeToSuperfluidService.mapSuperTokenToStripeCurrency(key);

      // superTokenAccountingService.

    });

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
