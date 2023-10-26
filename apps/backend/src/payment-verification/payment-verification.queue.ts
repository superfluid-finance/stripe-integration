import { BullModule } from '@nestjs/bullmq';

export const QUEUE_NAME = 'payment-verification';
export const FLOW_PRODUCER_NAME = 'payment-verification-flow-producer';

export const registerQueueModules = () => [
  BullModule.registerQueue({
    name: QUEUE_NAME,
  }),
  BullModule.registerFlowProducer({
    name: FLOW_PRODUCER_NAME,
  }),
];
