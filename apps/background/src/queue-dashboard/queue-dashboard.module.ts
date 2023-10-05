import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BasicAuthMiddleware } from './basic-auth.middleware';
import * as CheckoutSession from 'src/checkout-session/checkout-session.queue';
import * as PaymentTracker from 'src/payment-tracker/payment-tracker.queue';
import * as StripeListener from 'src/stripe-listener/stripe-listener.queue';

@Module({
  imports: [CheckoutSession.registerQueueModule(), PaymentTracker.registerQueueModule(), StripeListener.registerQueueModule()],
})
export class QueueDashboardModule implements NestModule {
  constructor(
    @InjectQueue(CheckoutSession.QUEUE_NAME)
    private readonly checkoutSessionQueue: Queue,
    @InjectQueue(PaymentTracker.QUEUE_NAME) private readonly paymentTrackerQueue: Queue,
    @InjectQueue(StripeListener.QUEUE_NAME) private readonly stripeListenerQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      serverAdapter,
      queues: [new BullMQAdapter(this.checkoutSessionQueue), new BullMQAdapter(this.paymentTrackerQueue), new BullMQAdapter(this.stripeListenerQueue)],
    });

    consumer.apply(BasicAuthMiddleware, serverAdapter.getRouter()).forRoutes('/queues');
  }
}
