import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';

type Response = {
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
};

@Controller('superfluid-stripe-converter')
export class SuperfluidStripeConverterController {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly superfluidStripeConverterService: SuperfluidStripeConverterService,
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

    const config = this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
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
}

const logger = new Logger(SuperfluidStripeConverterController.name);
