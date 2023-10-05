import { Module } from '@nestjs/common';
import { CheckoutSessionController } from './checkout-session.controller';
import { CheckoutSessionProcesser } from './checkout-session.processer';
import { registerQueueModule } from './checkout-session.queue';

@Module({
  imports: [registerQueueModule()],
  controllers: [CheckoutSessionController],
  providers: [CheckoutSessionProcesser],
})
export class CheckoutSessionModule {}
