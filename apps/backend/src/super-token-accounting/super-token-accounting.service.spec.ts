import { Test, TestingModule } from '@nestjs/testing';
import { SuperTokenAccountingService } from './super-token-accounting.service';

describe('SuperTokenAccountingService', () => {
  let service: SuperTokenAccountingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperTokenAccountingService],
    }).compile();

    service = module.get<SuperTokenAccountingService>(SuperTokenAccountingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
