import { Module } from '@nestjs/common';
import { PaymentVerificationProcessor } from './payment-verification.processor';
import { PaymentVerificationService } from './payment-verification.service';
import { registerQueueModules } from './payment-verification.queue';
import { registerStripeModule } from 'src/stripe-module-config';
import { SuperTokenAccountingModule } from 'src/super-token-accounting/super-token-accounting.module';
import { SuperfluidStripeConverterModule } from 'src/superfluid-stripe-converter/superfluid-stripe-converter.module';

@Module({
  imports: [
    ...registerQueueModules(),
    registerStripeModule(),
    SuperTokenAccountingModule,
    SuperfluidStripeConverterModule,
  ],
  providers: [PaymentVerificationProcessor, PaymentVerificationService],
  exports: [PaymentVerificationService],
})
export class PaymentVerificationModule {}
