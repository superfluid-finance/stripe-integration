import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { BullModule } from '@nestjs/bullmq';
import { QueueDashboardModule } from './queue-dashboard/bull-board.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CheckoutSessionModule } from './checkout-session/checkout-session.module';
import { StripeListenerModule } from './stripe-listener/stripe-listener.module';
import { InvoicePaymentTrackerModule } from './invoice-payment-tracker/invoice-payment-tracker.module';
import { SuperTokenAccountingModule } from './super-token-accounting/super-token-accounting.module';

const registerConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true,
  });

export const registerStripeModule = () =>
  StripeModule.forRootAsync(StripeModule, {
    inject: [ConfigService],
    useFactory: (configServide: ConfigService) => ({
      apiKey: configServide.getOrThrow('STRIPE_SECRET_KEY'),
      // TODO(KK): webhooks
    }),
  });

const registerBullModule = () =>
  BullModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      connection: {
        host: configService.getOrThrow('REDIS_HOST'),
        port: configService.getOrThrow('REDIS_PORT'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  });

@Module({
  imports: [
    registerConfigModule(),
    registerStripeModule(),
    registerBullModule(),
    InvoicesModule.register(),
    QueueDashboardModule,
    CheckoutSessionModule,
    StripeListenerModule,
    InvoicePaymentTrackerModule,
    SuperTokenAccountingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
