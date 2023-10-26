import { ConfigService } from '@nestjs/config';
import { StripeModule } from '@golevelup/nestjs-stripe';

/**
 * This is just an arbitrary paging limit. We mostly use "auto-paging" to just get all the results from Stripe to EASILY make CORRECT calculations.
 */
export const DEFAULT_PAGING: { limit: number } = { limit: 50 };

export function registerStripeModule() {
  return StripeModule.forRootAsync(StripeModule, {
    inject: [ConfigService],
    useFactory: (configServide: ConfigService) => ({
      apiKey: configServide.getOrThrow('STRIPE_SECRET_KEY'),
    }),
  });
}
