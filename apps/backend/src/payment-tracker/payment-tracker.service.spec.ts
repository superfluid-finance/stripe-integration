import { Test, TestingModule } from '@nestjs/testing';
import { PaymentTrackerService as PaymentTrackerService } from './payment-tracker.service';

describe('InvoicePaymentTrackerService', () => {
  let service: PaymentTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentTrackerService],
    }).compile();

    service = module.get<PaymentTrackerService>(PaymentTrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
