import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAME = 'stripe-listener';

export const registerQueueModule = () =>
  BullModule.registerQueue({
    name: QUEUE_NAME,
  });
