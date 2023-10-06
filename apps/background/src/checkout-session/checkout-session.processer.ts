import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateSessionData } from './checkout-session.controller';

export const CHECKOUT_SESSION_JOB_NAME = 'checkout-session';

type CheckoutSessionJob = Job<any, CreateSessionData, typeof CHECKOUT_SESSION_JOB_NAME>;

/**
 *
 */
@Processor(QUEUE_NAME)
export class CheckoutSessionProcesser extends WorkerHost {
  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    @InjectStripeClient() private readonly stripeClient: Stripe,
  ) {
    super();
  }

  async process(job: CheckoutSessionJob, token?: string): Promise<any> {
    this.stripeClient.customers.create(); // TODO

    // Handle job for ensuring customer on Stripe's end here
    // Have the job be self-scheduling, i.e. it reschedules for a while until it dies off if user didn't finish with the details
  }
}
