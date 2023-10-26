import { Test, TestingModule } from '@nestjs/testing';
import { PaymentVerificationService as PaymentVerificationService } from './payment-verification.service';

describe('InvoicePaymentVerificationService', () => {
  let service: PaymentVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentVerificationService],
    }).compile();

    service = module.get<PaymentVerificationService>(PaymentVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
