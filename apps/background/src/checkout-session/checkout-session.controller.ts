import { BadRequestException, Controller, Logger, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { toZod } from 'tozod';
import { z } from 'zod';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CHECKOUT_SESSION_JOB_NAME } from './checkout-session.processer';
import { ConfigService } from '@nestjs/config';

export type CreateSessionData = {
  chainId: number;
  tokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  email: string;
};
const CreateSessionData: toZod<CreateSessionData> = z.object({
  chainId: z.number(),
  tokenAddress: z.string().trim().toLowerCase().length(42),
  senderAddress: z.string().trim().toLowerCase().length(42),
  receiverAddress: z.string().trim().toLowerCase().length(42),
  email: z.string().trim().max(320),
});

@Controller('checkout-session')
export class CheckoutSessionController {
  private readonly apiKey: string;

  constructor(@InjectQueue(QUEUE_NAME) private readonly queue: Queue, configService: ConfigService) {
    this.apiKey = configService.getOrThrow('API_KEY');
  }

  @Post('create')
  async createSession(@Body() data: CreateSessionData, @Headers('x-api-key') apiKey: string): Promise<void> {
    if (apiKey !== this.apiKey) {
      throw new UnauthorizedException();
    }

    const validationResult = CreateSessionData.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error);
    }

    // Use encoded data as job ID for duplicate request idempotency.
    const jobId = Buffer.from(JSON.stringify(validationResult.data), 'utf-8').toString('base64');

    await this.queue.add(CHECKOUT_SESSION_JOB_NAME, validationResult.data, {
      // jobId: jobId,
    });
    // TODO: get payment option, customer details, create a job, monitor Stripe for new Customer creation (don't create a bunch of spam)
  }

  // Add endpoint to call "finalize session" directly?
}

const logger = new Logger(CheckoutSessionController.name);
