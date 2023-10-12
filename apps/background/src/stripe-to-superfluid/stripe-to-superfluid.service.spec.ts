import { Test, TestingModule } from '@nestjs/testing';
import { StripeToSuperfluidService } from './stripe-to-superfluid.service';

describe('StripeToSuperfluidService', () => {
  let service: StripeToSuperfluidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeToSuperfluidService],
    }).compile();

    service = module.get<StripeToSuperfluidService>(StripeToSuperfluidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
