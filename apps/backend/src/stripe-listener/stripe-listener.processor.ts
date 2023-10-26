import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './stripe-listener.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { PAYMENT_VERIFICATION_JOB_NAME } from 'src/payment-verification/payment-verification.processor';
import { PaymentVerificationService } from 'src/payment-verification/payment-verification.service';
import { DEFAULT_PAGING } from 'src/stripeModuleConfig';

export const STRIPE_LISTENER_JOB_NAME = 'poll-new-invoices';

type StripeListenerJob = Job<
  {
    stripeCustomerId?: string;
  },
  any,
  typeof STRIPE_LISTENER_JOB_NAME
>;

/**
 *
 */
@Processor(QUEUE_NAME)
export class StripeListenerProcessor extends WorkerHost {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly paymentVerificationService: PaymentVerificationService,
  ) {
    super();
  }

  async process(job: StripeListenerJob, token?: string) {
    const invoices = await this.stripeClient.invoices
      .list({
        collection_method: 'send_invoice',
        status: 'open',
        customer: job.data.stripeCustomerId,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    await this.paymentVerificationService.handleOpenStripeInvoices(invoices);
  }
}

const logger = new Logger(StripeListenerProcessor.name);
