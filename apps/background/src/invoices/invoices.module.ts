import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { INVOICE_POLLING_QUEUE_NAME, registerInvoicePollingQueueModule } from './invoice-polling.queue';
import { InvoicePollingProcessor } from './invoice-polling.processor';
import { Job, Queue } from 'bullmq';
import { registerStripeModule } from 'src/app.module';
import { registerInvoicesQueueModule } from './invoices.queue';

export const POLL_STRIP_INVOICES_NAME_AND_ID = 'poll-stripe-invoices';

@Module({})
export class InvoicesModule implements OnModuleInit {
  static register(): DynamicModule {
    const invoicePollingQueueModule = registerInvoicePollingQueueModule();
    const invoicesQueueModule = registerInvoicesQueueModule();

    return {
      module: InvoicesModule,
      imports: [registerStripeModule(), BullModule, invoicePollingQueueModule, invoicesQueueModule],
      providers: [...invoicePollingQueueModule.providers, ...invoicesQueueModule.providers, InvoicePollingProcessor],
      exports: [...invoicePollingQueueModule.exports, ...invoicesQueueModule.exports],
    };
  }

  constructor(
    @InjectQueue(INVOICE_POLLING_QUEUE_NAME)
    private readonly invoicePollingQueue: Queue,
  ) {}

  onModuleInit() {
    this.invoicePollingQueue.add(
      POLL_STRIP_INVOICES_NAME_AND_ID,
      {},
      {
        jobId: POLL_STRIP_INVOICES_NAME_AND_ID, // This avoids duplicate repeating jobs being created.
        repeat: {
          pattern: '* * * * *', // Repeat every minute. Check with: https://crontab.guru/
        },
      },
    );
    logger.debug('onModuleInit');
  }
}

const logger = new Logger(InvoicesModule.name);
