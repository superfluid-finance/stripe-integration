import { Module } from '@nestjs/common';
import { SuperfluidStripeConverterController } from './superfluid-stripe-converter.controller';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';
import { registerStripeModule } from 'src/stripe-module-config';
import { SuperfluidStripeConfigService } from './superfluid-stripe-config/superfluid-stripe-config.service';

@Module({
  imports: [registerStripeModule()],
  controllers: [SuperfluidStripeConverterController],
  providers: [SuperfluidStripeConverterService, SuperfluidStripeConfigService],
  exports: [SuperfluidStripeConverterService],
})
export class SuperfluidStripeConverterModule {}
