import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Queue } from 'bullmq';
import { INVOICE_POLLING_QUEUE_NAME, registerInvoicePollingQueueModule } from 'src/invoices/invoice-polling.queue';
import { BasicAuthMiddleware } from './basic-auth.middleware';
import { INVOICES_QUEUE_NAME, registerInvoicesQueueModule } from 'src/invoices/invoices.queue';

@Module({
  imports: [registerInvoicePollingQueueModule(), registerInvoicesQueueModule()],
})
export class QueueDashboardModule implements NestModule {
  constructor(
    @InjectQueue(INVOICE_POLLING_QUEUE_NAME)
    private readonly invoicePollingQueue: Queue,
    @InjectQueue(INVOICES_QUEUE_NAME) private readonly invoicesQueue: Queue,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      serverAdapter,
      queues: [new BullMQAdapter(this.invoicePollingQueue), new BullMQAdapter(this.invoicesQueue)],
    });

    consumer.apply(BasicAuthMiddleware, serverAdapter.getRouter()).forRoutes('/queues');
  }
}
