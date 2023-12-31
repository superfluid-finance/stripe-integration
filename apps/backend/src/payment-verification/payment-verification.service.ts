import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import Stripe from 'stripe';
import { QUEUE_NAME } from './payment-verification.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { PAYMENT_VERIFICATION_JOB_NAME } from './payment-verification.processor';

/**
 * Handles Stripe invoices:
 * - invoice aggregation
 * - produces payment marking jobs
 */
@Injectable()
export class PaymentVerificationService {
  constructor(@InjectQueue(QUEUE_NAME) private readonly queue: Queue) {}

  /**
   *
   * @param invoices
   */
  async handleOpenStripeInvoices(invoices: ReadonlyArray<Stripe.Invoice>) {
    logger.debug('Queried stripe invoices count: ' + invoices.length);

    // Validate invoice is open
    // Validate invoice is meant for Superfluid

    const jobs = await this.queue.addBulk(
      invoices.map((invoice) => ({
        name: PAYMENT_VERIFICATION_JOB_NAME,
        data: {}, // TODO: Storing the whole invoice seems totally excessive
        opts: {
          jobId: invoice.customer as string, // TODO(KK): not quite right
        },
      })),
    );

    logger.debug('Added more jobs: ' + jobs.length);
  }
}

const logger = new Logger(PaymentVerificationService.name);
