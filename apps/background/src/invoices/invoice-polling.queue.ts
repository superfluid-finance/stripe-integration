import { BullModule } from '@nestjs/bullmq';

export const INVOICE_POLLING_QUEUE_NAME = 'invoice-polling';

export const registerInvoicePollingQueueModule = () =>
  BullModule.registerQueue({
    name: INVOICE_POLLING_QUEUE_NAME,
  });
