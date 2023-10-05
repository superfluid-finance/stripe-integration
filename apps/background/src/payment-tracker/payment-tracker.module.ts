import { Module } from '@nestjs/common';
import { PaymentTrackerProcessor } from './payment-tracker.processor';
import { PaymentTrackerService } from './payment-tracker.service';
import { registerQueueModule } from './payment-tracker.queue';
import registerStripeModule from 'src/registerStripeModule';

@Module({
  imports: [registerQueueModule(), registerStripeModule()],
  providers: [PaymentTrackerProcessor, PaymentTrackerService],
  exports: [PaymentTrackerService]
})
export class PaymentTrackerModule {}
