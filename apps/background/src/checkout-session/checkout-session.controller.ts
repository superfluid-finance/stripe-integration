import { BadRequestException, Controller, Post } from '@nestjs/common';
import { toZod } from 'tozod';
import { z } from 'zod';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CHECKOUT_SESSION_JOB_NAME } from './checkout-session.processer';

export type CreateSessionData = {
  chainId: number;
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  email: string;
};
const CreateSessionData: toZod<CreateSessionData> = z.object({
  chainId: z.number(),
  tokenAddress: z.string().trim(),
  senderAddress: z.string().trim(),
  receiverAddress: z.string().trim(),
  email: z.string().trim().max(320),
});

type Request = {
  apiKey: string;
  data: CreateSessionData;
};
const Request = z
  .object({
    apiKey: z.string(),
    data: CreateSessionData,
  })
  .strict();

@Controller('checkout-session')
export class CheckoutSessionController {
  constructor(@InjectQueue(QUEUE_NAME) private readonly queue: Queue) {}

  @Post('create')
  createSession(request: Request) {
    // TODO: Authorize based on API key
    // throw new UnauthorizedException();

    const validationResult = CreateSessionData.safeParse(request);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error);
    }

    // Use encoded data as job ID for duplicate request idempotency.
    const jobId = Buffer.from(JSON.stringify(request.data), 'utf-8').toString('base64');

    this.queue.add(CHECKOUT_SESSION_JOB_NAME, request.data, {
      jobId: jobId,
    });

    // TODO: get payment option, customer details, create a job, monitor Stripe for new Customer creation (don't create a bunch of spam)
  }

  // Add endpoint to call "finalize session" directly?
}
