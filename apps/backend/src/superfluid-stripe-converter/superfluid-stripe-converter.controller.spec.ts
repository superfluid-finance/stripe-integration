import { Test, TestingModule } from '@nestjs/testing';
import { SuperfluidStripeConverterController } from './superfluid-stripe-converter.controller';

describe('SuperfluidStripeConverterController', () => {
  let controller: SuperfluidStripeConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperfluidStripeConverterController],
    }).compile();

    controller = module.get<SuperfluidStripeConverterController>(
      SuperfluidStripeConverterController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
