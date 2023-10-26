import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutSessionProcesser } from './checkout-session.processer';

describe('CheckoutSessionService', () => {
  let service: CheckoutSessionProcesser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckoutSessionProcesser],
    }).compile();

    service = module.get<CheckoutSessionProcesser>(CheckoutSessionProcesser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
