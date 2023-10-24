import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { StripeToSuperfluidService } from './stripe-to-superfluid.service';

type Response = {
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
};

@Controller('stripe-to-superfluid')
export class StripeToSuperfluidController {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly stripeToSuperfluidService: StripeToSuperfluidService,
  ) {}

  // TODO: Does this need auth?
  @Get('checkout-widget')
  async mapStripeProductToCheckoutWidget(
    @Query('product-id') productId: string,
  ): Promise<Response> {
    const [stripeProductsResponse, stripePricesResponse] = await Promise.all([
      this.stripeClient.products.retrieve(productId),
      this.stripeClient.prices.list({
        product: productId,
        active: true,
      }),
    ]);

    const config = this.stripeToSuperfluidService.mapStripeProductToWidgetConfig({
      product: stripeProductsResponse,
      prices: stripePricesResponse.data,
    });

    // logger.debug({
    //   stripeProductsResponse,
    //   stripePricesResponse,
    //   productId,
    //   config,
    // });

    return config;
  }

  @Get("currency-token-map")
  async stripeCurrencyToSuperTokenMap() {
    return Object.fromEntries(this.stripeToSuperfluidService.stripeCurrencyToSuperTokenMap);
  }

  @Get("chain-receiver-map")
  async chainToSuperTokenReceiverMap() {
    return Object.fromEntries(this.stripeToSuperfluidService.chainToSuperTokenReceiverMap);
  }
}

const logger = new Logger(StripeToSuperfluidController.name);
