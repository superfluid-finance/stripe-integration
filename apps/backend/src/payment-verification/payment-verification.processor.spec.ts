import { Test, TestingModule } from '@nestjs/testing';
import { PaymentVerificationProcessor } from './payment-verification.processor';

describe('InvoicePaymentVerificationService', () => {
  let service: PaymentVerificationProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentVerificationProcessor],
    }).compile();

    service = module.get<PaymentVerificationProcessor>(PaymentVerificationProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
