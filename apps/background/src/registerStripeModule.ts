import { ConfigService } from '@nestjs/config';
import { StripeModule } from '@golevelup/nestjs-stripe';

export default function registerStripeModule() {
  return StripeModule.forRootAsync(StripeModule, {
    inject: [ConfigService],
    useFactory: (configServide: ConfigService) => ({
      apiKey: configServide.getOrThrow('STRIPE_SECRET_KEY'),
    }),
  });
}
