import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAME } from './payment-tracker.queue';

export const PAYMENT_TRACKER_JOB_NAME = 'verify-customer-invoice-payments-by-super-token';

type PaymentTrackerJob = Job<any, any, typeof PAYMENT_TRACKER_JOB_NAME>;

/**
 *
 */
@Processor(QUEUE_NAME)
export class PaymentTrackerProcessor extends WorkerHost {
  process(job: PaymentTrackerJob, token?: string): Promise<any> {
    throw new Error('Method not implemented.');

    // Decide how to handle different tokens?
    // Decide if FlowProducer should be used per Customer?
    // Decide if should split anything based on receiver address?

    // Create FIFO strategy for dispersing payments
    // How to track used up payments?
  }
}
