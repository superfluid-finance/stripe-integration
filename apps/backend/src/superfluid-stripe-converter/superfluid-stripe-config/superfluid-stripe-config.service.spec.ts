import { Test, TestingModule } from '@nestjs/testing';
import { SuperfluidStripeConfigService } from './superfluid-stripe-config.service';

describe('SuperfluidStripeConfigService', () => {
  let service: SuperfluidStripeConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperfluidStripeConfigService],
    }).compile();

    service = module.get<SuperfluidStripeConfigService>(SuperfluidStripeConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
