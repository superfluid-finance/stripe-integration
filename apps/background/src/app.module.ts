import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from './bull-board/bull-board.module';
import { InvoicesModule } from './invoices/invoices.module';

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
    BullBoardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
