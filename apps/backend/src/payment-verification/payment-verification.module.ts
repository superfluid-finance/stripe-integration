import { Module } from '@nestjs/common';
import { PaymentVerificationProcessor } from './payment-verification.processor';
import { PaymentVerificationService } from './payment-verification.service';
import { registerQueueModules } from './payment-verification.queue';
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
  providers: [PaymentVerificationProcessor, PaymentVerificationService],
  exports: [PaymentVerificationService],
})
export class PaymentVerificationModule {}
