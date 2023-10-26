import { Module } from '@nestjs/common';
import { SuperTokenAccountingService } from './super-token-accounting.service';

@Module({
  providers: [SuperTokenAccountingService],
  exports: [SuperTokenAccountingService],
})
export class SuperTokenAccountingModule {}
