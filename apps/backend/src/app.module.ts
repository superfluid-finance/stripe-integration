import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { redisStore } from 'cache-manager-redis-store';
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
  CacheModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const store = await redisStore({
        socket: {
          host: config.getOrThrow('REDIS_HOST'),
          port: Number(config.getOrThrow('REDIS_PORT')),
        },
        username: config.get('REDIS_USER'),
        password: config.get('REDIS_PASSWORD')
      });

      return {
        isGlobal: true,
        store: store as unknown as CacheStore, // Nest.js hasn't caught up with right types
        ttl: 3000, // In cache-manager v5, TTL is configured in milliseconds: https://docs.nestjs.com/techniques/caching
      };
    },
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
