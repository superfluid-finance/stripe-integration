import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BasicAuthMiddleware } from './basic-auth.middleware';
import * as CheckoutSession from 'src/checkout-session/checkout-session.queue';
import * as PaymentVerification from 'src/payment-verification/payment-verification.queue';
import * as StripeListener from 'src/stripe-listener/stripe-listener.queue';

@Module({
  imports: [
    CheckoutSession.registerQueueModule(),
    ...PaymentVerification.registerQueueModules(),
    StripeListener.registerQueueModule(),
  ],
})
export class QueueDashboardModule implements NestModule {
  constructor(
    @InjectQueue(CheckoutSession.QUEUE_NAME)
    private readonly checkoutSessionQueue: Queue,
    @InjectQueue(PaymentVerification.QUEUE_NAME)
    private readonly paymentVerificationQueue: Queue,
    @InjectQueue(StripeListener.QUEUE_NAME)
    private readonly stripeListenerQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      serverAdapter,
      queues: [
        new BullMQAdapter(this.checkoutSessionQueue),
        new BullMQAdapter(this.paymentVerificationQueue),
        new BullMQAdapter(this.stripeListenerQueue),
      ],
    });

    consumer.apply(BasicAuthMiddleware, serverAdapter.getRouter()).forRoutes('/queues');
  }
}
