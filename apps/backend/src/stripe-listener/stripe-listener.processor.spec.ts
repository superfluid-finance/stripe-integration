import { Test, TestingModule } from '@nestjs/testing';
import { StripeListenerProcessor } from './stripe-listener.processor';

describe('StripeListenerService', () => {
  let service: StripeListenerProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeListenerProcessor],
    }).compile();

    service = module.get<StripeListenerProcessor>(StripeListenerProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
