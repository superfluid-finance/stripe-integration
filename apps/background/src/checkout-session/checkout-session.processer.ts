import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateSessionData } from './checkout-session.controller';

export const CHECKOUT_SESSION_JOB_NAME = 'checkout-session';

type UserId = string;
type CheckoutSessionJob = Job<CreateSessionData, UserId, typeof CHECKOUT_SESSION_JOB_NAME>;

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

  async process(job: CheckoutSessionJob, token?: string): Promise<UserId> {
    const data = job.data;

    const customerSearchParams: Stripe.CustomerSearchParams = {
      query: `metadata['senderAddress']:'${data.senderAddress}'`,
    };
    const customersSearchResponse = await this.stripeClient.customers.search(customerSearchParams);

    // TODO: pre-condition if need to create customer

    const customerCreateParams: Stripe.CustomerCreateParams = {
      email: data.email,
      metadata: {
        // What else is _required_ here?
        senderAddress: data.senderAddress, // TODO(KK): Any way to use array here?
      },
    };
    const customersCreateResponse = await this.stripeClient.customers.create(customerCreateParams);

    // const subscriptionsCreateResponse = await this.stripeClient.subscriptions.create({

    // });

    logger.debug({
      job,
      token,
      customerSearchParams,
      customersSearchResponse,
      customerCreateParams,
      customersCreateResponse,
    });

    return customersCreateResponse.id;

    // Handle job for ensuring customer on Stripe's end here
    // Have the job be self-scheduling, i.e. it reschedules for a while until it dies off if user didn't finish with the details
  }
}

const logger = new Logger(CheckoutSessionProcesser.name);
