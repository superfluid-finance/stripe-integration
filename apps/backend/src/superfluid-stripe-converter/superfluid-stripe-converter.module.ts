import { Module } from '@nestjs/common';
import { SuperfluidStripeConverterController } from './superfluid-stripe-converter.controller';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';
import { registerStripeModule } from 'src/stripeModuleConfig';

@Module({
  imports: [registerStripeModule()],
  controllers: [SuperfluidStripeConverterController],
  providers: [SuperfluidStripeConverterService],
  exports: [SuperfluidStripeConverterService],
})
export class SuperfluidStripeConverterModule {}
