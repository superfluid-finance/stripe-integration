import { Logger, Module } from '@nestjs/common';
import { STRIPE_LISTENER_JOB_NAME, StripeListenerProcessor } from './stripe-listener.processor';
import { StripeListenerController } from './stripe-listener.controller';
import { QUEUE_NAME, registerQueueModule } from './stripe-listener.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { PaymentVerificationModule } from 'src/payment-verification/payment-verification.module';
import { registerStripeModule } from 'src/stripeModuleConfig';

@Module({
  imports: [registerQueueModule(), registerStripeModule(), PaymentVerificationModule],
  providers: [StripeListenerProcessor],
  controllers: [StripeListenerController],
})
export class StripeListenerModule {
  constructor(
    @InjectQueue(QUEUE_NAME)
    private readonly queue: Queue,
  ) {}

  onModuleInit() {
    this.queue.add(
      STRIPE_LISTENER_JOB_NAME, // name
      {}, // data
      {
        jobId: STRIPE_LISTENER_JOB_NAME, // This avoids duplicate repeating jobs being created.
        repeat: {
          pattern: '* * * * *', // Repeat every minute. Check with: https://crontab.guru/
        },
      }, // options
    );
    logger.debug('onModuleInit');
  }
}

const logger = new Logger(StripeListenerModule.name);
