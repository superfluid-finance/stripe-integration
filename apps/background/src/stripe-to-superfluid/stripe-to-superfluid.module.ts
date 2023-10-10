import { Module } from '@nestjs/common';
import { StripeToSuperfluidController } from './stripe-to-superfluid.controller';
import { StripeToSuperfluidService } from './stripe-to-superfluid.service';
import registerStripeModule from 'src/registerStripeModule';

@Module({
  imports: [registerStripeModule()],
  controllers: [StripeToSuperfluidController],
  providers: [StripeToSuperfluidService],
  exports: [StripeToSuperfluidService]
})
export class StripeToSuperfluidModule {}
