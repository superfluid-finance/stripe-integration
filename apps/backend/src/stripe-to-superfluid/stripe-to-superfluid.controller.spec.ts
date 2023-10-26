import { Test, TestingModule } from '@nestjs/testing';
import { StripeToSuperfluidController } from './stripe-to-superfluid.controller';

describe('StripeToSuperfluidController', () => {
  let controller: StripeToSuperfluidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeToSuperfluidController],
    }).compile();

    controller = module.get<StripeToSuperfluidController>(StripeToSuperfluidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
