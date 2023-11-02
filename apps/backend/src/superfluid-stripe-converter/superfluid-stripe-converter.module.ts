import { Module, OnModuleInit } from '@nestjs/common';
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
export class SuperfluidStripeConverterModule implements OnModuleInit {
  constructor(
    private readonly configService: SuperfluidStripeConfigService,
  ) {}

  async onModuleInit() {
    // Initialize the Superfluid-Stripe integration global configuration objects (e.g. the "fake" Stripe Customers)
    await this.configService.loadOrInitializeConfig();
  }
}
