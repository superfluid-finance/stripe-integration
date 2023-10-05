import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import Stripe from 'stripe';
import { QUEUE_NAME } from './payment-tracker.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { PAYMENT_TRACKER_JOB_NAME } from './payment-tracker.processor';

/**
 * Handles Stripe invoices:
 * - invoice aggregation
 * - produces payment marking jobs
 */
@Injectable()
export class PaymentTrackerService {
  constructor(@InjectQueue(QUEUE_NAME) private readonly queue: Queue) {}

  /**
   *
   * @param invoices
   */
  async handleStripeInvoices(invoices: ReadonlyArray<Stripe.Invoice>) {
    // TODO: handle "has_more"?
    logger.debug('Queried stripe invoices count: ' + invoices.length);

    const jobs = await this.queue.addBulk(
      invoices.map((invoice) => ({
        name: PAYMENT_TRACKER_JOB_NAME,
        data: {}, // TODO: Storing the whole invoice seems totally excessive
        opts: {
          jobId: invoice.customer as string, // TODO(KK): not quite right
        },
      })),
    );

    logger.debug('Added more jobs: ' + jobs.length);
  }
}

const logger = new Logger(PaymentTrackerService.name);
