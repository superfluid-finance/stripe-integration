import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAME = 'payment-tracker';
export const FLOW_PRODUCER_NAME = 'payment-tracker-flow-producer';

export const registerQueueModules = () => [
  BullModule.registerQueue({
    name: QUEUE_NAME,
  }),
  BullModule.registerFlowProducer({
    name: FLOW_PRODUCER_NAME
  }),
];
