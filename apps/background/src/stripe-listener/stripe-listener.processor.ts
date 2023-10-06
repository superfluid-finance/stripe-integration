import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './stripe-listener.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { PAYMENT_TRACKER_JOB_NAME } from 'src/payment-tracker/payment-tracker.processor';
import { PaymentTrackerService } from 'src/payment-tracker/payment-tracker.service';

export const STRIPE_LISTENER_JOB_NAME = 'poll-new-invoices';

type StripeListenerJob = Job<any, any, typeof STRIPE_LISTENER_JOB_NAME>;

/**
 *
 */
@Processor(QUEUE_NAME)
export class StripeListenerProcessor extends WorkerHost {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly paymentTrackerService: PaymentTrackerService,
  ) {
    super();
  }

  async process(job: StripeListenerJob, token?: string) {
    const stripeInvoicesResponse = await this.stripeClient.invoices.list({
      collection_method: 'send_invoice',
      status: 'open',
    });

    // TODO: handle "has_more"?
    const stripeInvoices = stripeInvoicesResponse.data;

    await this.paymentTrackerService.handleStripeInvoices(stripeInvoices);
  }
}

const logger = new Logger(StripeListenerProcessor.name);