import { BullModule } from "@nestjs/bullmq";

export const INVOICES_QUEUE_NAME = "invoices";

export const registerInvoicesQueueModule = () => BullModule.registerQueue({
    name: INVOICES_QUEUE_NAME
});