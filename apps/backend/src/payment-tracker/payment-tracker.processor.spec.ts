import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTrackerProcessor } from './payment-tracker.processor';

describe('InvoicePaymentTrackerService', () => {
  let service: PaymentTrackerProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentTrackerProcessor],
    }).compile();

    service = module.get<PaymentTrackerProcessor>(PaymentTrackerProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
