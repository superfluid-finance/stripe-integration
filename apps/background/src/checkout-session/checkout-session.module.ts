import { Module } from '@nestjs/common';
import { CheckoutSessionController } from './checkout-session.controller';
import { CheckoutSessionProcesser } from './checkout-session.processer';
import { registerQueueModule } from './checkout-session.queue';
import registerStripeModule from 'src/registerStripeModule';

@Module({
  imports: [registerQueueModule(), registerStripeModule()],
  controllers: [CheckoutSessionController],
  providers: [CheckoutSessionProcesser],
})
export class CheckoutSessionModule {}
