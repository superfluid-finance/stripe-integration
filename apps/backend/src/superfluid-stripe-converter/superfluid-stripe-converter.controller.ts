import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import { SuperfluidStripeConfigService } from './superfluid-stripe-config/superfluid-stripe-config.service';

type ProductResponse = {
  stripeProduct: Stripe.Product;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
};

@Controller('superfluid-stripe-converter')
export class SuperfluidStripeConverterController {
  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly superfluidStripeConverterService: SuperfluidStripeConverterService,
    private readonly superfluidStripeConfigService: SuperfluidStripeConfigService,
  ) {}

  // TODO: Does this need auth?
  @Get('product')
  async mapStripeProductToCheckoutWidget(
    @Query('product-id') productId: string,
  ): Promise<ProductResponse> {
    const [stripeProduct, stripePrices, integrationConfig] = await Promise.all([
      this.stripeClient.products.retrieve(productId),
      this.stripeClient.prices
        .list({
          product: productId,
          active: true,
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.superfluidStripeConfigService.loadOrInitializeConfig(),
    ]);

    // check eligibility somewhere?

    const wigetConfig = await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
      integrationConfig: integrationConfig,
      product: stripeProduct,
      prices: stripePrices,
    });

    return { ...wigetConfig, stripeProduct: stripeProduct };
  }

  @Get('products')
  async products(): Promise<ProductResponse[]> {
    const [stripeProducts, stripePrices, integrationConfig] = await Promise.all([
      this.stripeClient.products
        .list({
          active: true,
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.stripeClient.prices
        .list({
          active: true,
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.superfluidStripeConfigService.loadOrInitializeConfig(),
    ]);

    // check eligibility somewhere?

    const results = await Promise.all(
      stripeProducts.map(async (stripeProduct) => {
        const pricesForProduct = stripePrices.filter((price) => price.product === stripeProduct.id);

        const config = await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
          product: stripeProduct,
          prices: pricesForProduct,
          integrationConfig,
        });

        return { ...config, stripeProduct };
      }),
    );

    return results;
  }
}

const logger = new Logger(SuperfluidStripeConverterController.name);
