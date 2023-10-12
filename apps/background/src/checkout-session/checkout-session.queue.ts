import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAME = 'checkout-session';

export const registerQueueModule = () =>
  BullModule.registerQueue({
    name: QUEUE_NAME,
  });
