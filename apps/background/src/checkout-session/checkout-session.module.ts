import { Module } from '@nestjs/common';
import { CheckoutSessionController } from './checkout-session.controller';
import { CheckoutSessionProcesser } from './checkout-session.processer';
import { registerQueueModule } from './checkout-session.queue';
import { registerStripeModule } from 'src/stripeModuleConfig';
import { StripeToSuperfluidModule } from 'src/stripe-to-superfluid/stripe-to-superfluid.module';

@Module({
  imports: [registerQueueModule(), registerStripeModule(), StripeToSuperfluidModule],
  controllers: [CheckoutSessionController],
  providers: [CheckoutSessionProcesser],
})
export class CheckoutSessionModule {}
