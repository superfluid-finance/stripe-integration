import { Module } from '@nestjs/common';
import { PaymentTrackerProcessor } from './payment-tracker.processor';
import { PaymentTrackerService } from './payment-tracker.service';
import { registerQueueModules } from './payment-tracker.queue';
import { registerStripeModule } from 'src/stripeModuleConfig';
import { SuperTokenAccountingModule } from 'src/super-token-accounting/super-token-accounting.module';
import { StripeToSuperfluidModule } from 'src/stripe-to-superfluid/stripe-to-superfluid.module';

@Module({
  imports: [
    ...registerQueueModules(),
    registerStripeModule(),
    SuperTokenAccountingModule,
    StripeToSuperfluidModule,
  ],
  providers: [PaymentTrackerProcessor, PaymentTrackerService],
  exports: [PaymentTrackerService],
})
export class PaymentTrackerModule {}
