import { Controller, Post } from '@nestjs/common';

@Controller('checkout-session')
export class CheckoutSessionController {
  @Post('create')
  createSession() {
    // TODO: get payment option, customer details, create a job, monitor Stripe for new Customer creation (don't create a bunch of spam)
  }

  // Add endpoint to call "finalize session" directly?
}
