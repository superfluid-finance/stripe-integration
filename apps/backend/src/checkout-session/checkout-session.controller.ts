import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { z } from 'zod';
import { QUEUE_NAME } from './checkout-session.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CHECKOUT_SESSION_JOB_NAME } from './checkout-session.processer';
import { ConfigService } from '@nestjs/config';
import { ApiProperty } from '@nestjs/swagger';
import stringify from 'safe-stable-stringify';

export const AddressSchema = z.string().trim().toLowerCase().length(42);
type Address = z.infer<typeof AddressSchema>;

export class CreateSessionData {
  @ApiProperty() productId: string;
  @ApiProperty() chainId: number;
  @ApiProperty() superTokenAddress: Address;
  @ApiProperty() senderAddress: Address;
  @ApiProperty() receiverAddress: Address;
  @ApiProperty() email: string;

  static schema: z.ZodType<CreateSessionData> = z
    .object({
      chainId: z.number(),
      productId: z.string().trim().max(255),
      superTokenAddress: AddressSchema,
      senderAddress: AddressSchema,
      receiverAddress: AddressSchema,
      email: z.string().trim().max(320).email(),
    })
    .strip();
}

@Controller('checkout-session')
export class CheckoutSessionController {
  private readonly apiKeys: string[];

  constructor(
    @InjectQueue(QUEUE_NAME) private readonly queue: Queue,
    configService: ConfigService,
  ) {
    const internalApiKey = configService.get('INTERNAL_API_KEY');
    const stripeSecretKey = configService.getOrThrow('STRIPE_SECRET_KEY');
    if (internalApiKey) {
      this.apiKeys = [internalApiKey, stripeSecretKey];
    } else {
      this.apiKeys = [stripeSecretKey];
    }
  }

  @Post('create')
  async createSession(
    @Headers('x-api-key') apiKey: string,
    @Body() data: CreateSessionData,
  ): Promise<void> {
    if (!this.apiKeys.includes(apiKey)) {
      throw new UnauthorizedException();
    }

    const validationResult = CreateSessionData.schema.safeParse(data);
    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error);
    }

    // Consider request de-duplication here with the deterministic job ID.
    const jobId = stringify(validationResult.data);
    await this.queue.add(CHECKOUT_SESSION_JOB_NAME, validationResult.data, {
      jobId: jobId,
      // Remove finished job ASAP in case a new fresh job is triggered.
      removeOnComplete: false,
      removeOnFail: true,
    });
  }

  // Add endpoint to call "finalize session" directly?
}

const logger = new Logger(CheckoutSessionController.name);
