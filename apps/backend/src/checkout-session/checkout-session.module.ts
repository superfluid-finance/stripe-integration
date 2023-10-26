import { Module } from '@nestjs/common';
import { CheckoutSessionController } from './checkout-session.controller';
import { CheckoutSessionProcesser } from './checkout-session.processer';
import { registerQueueModule } from './checkout-session.queue';
import { registerStripeModule } from 'src/stripeModuleConfig';
import { SuperfluidStripeConverterModule } from 'src/superfluid-stripe-converter/superfluid-stripe-converter.module';

@Module({
  imports: [registerQueueModule(), registerStripeModule(), SuperfluidStripeConverterModule],
  controllers: [CheckoutSessionController],
  providers: [CheckoutSessionProcesser],
})
export class CheckoutSessionModule {}
