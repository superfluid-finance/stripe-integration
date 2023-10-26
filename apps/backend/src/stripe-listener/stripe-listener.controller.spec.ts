import { Test, TestingModule } from '@nestjs/testing';
import { StripeListenerController } from './stripe-listener.controller';

describe('StripeListenerController', () => {
  let controller: StripeListenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeListenerController],
    }).compile();

    controller = module.get<StripeListenerController>(StripeListenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
