import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAME } from './checkout-session.queue';

type CheckoutSessionJob = Job<any, any, string>;

@Processor(QUEUE_NAME)
export class CheckoutSessionProcesser extends WorkerHost {
  process(job: CheckoutSessionJob, token?: string): Promise<any> {
    throw new Error('Method not implemented.');

    // Handle job for ensuring customer on Stripe's end here
    // Have the job be self-scheduling, i.e. it reschedules for a while until it dies off if user didn't finish with the details
  }
}
