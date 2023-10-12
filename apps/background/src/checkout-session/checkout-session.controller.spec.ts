import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutSessionController } from './checkout-session.controller';

describe('CheckoutSessionController', () => {
  let controller: CheckoutSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutSessionController],
    }).compile();

    controller = module.get<CheckoutSessionController>(CheckoutSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
