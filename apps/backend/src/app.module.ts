import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CacheInterceptor, CacheModule, CacheStore } from '@nestjs/cache-manager';
import { QueueDashboardModule } from './queue-dashboard/queue-dashboard.module';
import { CheckoutSessionModule } from './checkout-session/checkout-session.module';
import { StripeListenerModule } from './stripe-listener/stripe-listener.module';
import { PaymentVerificationModule } from './payment-verification/payment-verification.module';
import { SuperTokenAccountingModule } from './super-token-accounting/super-token-accounting.module';
import { SuperfluidStripeConverterModule } from './superfluid-stripe-converter/superfluid-stripe-converter.module';
import { HealthModule } from './health/health.module';
import { registerStripeModule } from './stripe-module-config';
import { APP_INTERCEPTOR } from '@nestjs/core';

const registerConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true,
  });

const registerBullModule = () =>
  BullModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
      connection: {
        host: config.getOrThrow('REDIS_HOST'),
        port: config.getOrThrow('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
        username: config.get('REDIS_USER'),
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

const registerCacheModule = () =>
  CacheModule.register({
    ttl: 30 * 1000, // We're using cache-manager v5 so need to specify in milliseconds: https://docs.nestjs.com/techniques/caching
    max: 25,
  });

@Module({
  imports: [
    registerConfigModule(),
    registerCacheModule(),
    registerStripeModule(),
    registerBullModule(),
    QueueDashboardModule,
    CheckoutSessionModule,
    StripeListenerModule,
    PaymentVerificationModule,
    SuperTokenAccountingModule,
    SuperfluidStripeConverterModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
