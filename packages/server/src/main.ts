import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { addJobs } from './bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // bullmq
  // addJobs();

  await app.listen(3000);
}
bootstrap();
