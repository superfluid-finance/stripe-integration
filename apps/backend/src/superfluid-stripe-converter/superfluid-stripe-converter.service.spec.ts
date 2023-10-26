import { Test, TestingModule } from '@nestjs/testing';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';

describe('SuperfluidStripeConverterService', () => {
  let service: SuperfluidStripeConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperfluidStripeConverterService],
    }).compile();

    service = module.get<SuperfluidStripeConverterService>(SuperfluidStripeConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
