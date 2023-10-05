import { Module } from '@nestjs/common';
import { SuperTokenAccountingService } from './super-token-accounting.service';

@Module({
  providers: [SuperTokenAccountingService],
})
export class SuperTokenAccountingModule {}
