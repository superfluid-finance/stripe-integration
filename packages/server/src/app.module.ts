import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueuesModule } from './queues/queues.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), QueuesModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
