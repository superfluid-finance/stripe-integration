import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAME = 'payment-tracker';

export const registerQueueModule = () =>
  BullModule.registerQueue({
    name: QUEUE_NAME,
  });
