import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueDashboardModule } from './queue-dashboard/queue-dashboard.module';
import { CheckoutSessionModule } from './checkout-session/checkout-session.module';
import { StripeListenerModule } from './stripe-listener/stripe-listener.module';
import { PaymentTrackerModule } from './payment-tracker/payment-tracker.module';
import { SuperTokenAccountingModule } from './super-token-accounting/super-token-accounting.module';
import { StripeToSuperfluidModule } from './stripe-to-superfluid/stripe-to-superfluid.module';
import { HealthModule } from './health/health.module';
import registerStripeModule from './registerStripeModule';

const registerConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true,
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
    QueueDashboardModule,
    CheckoutSessionModule,
    StripeListenerModule,
    PaymentTrackerModule,
    SuperTokenAccountingModule,
    StripeToSuperfluidModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
