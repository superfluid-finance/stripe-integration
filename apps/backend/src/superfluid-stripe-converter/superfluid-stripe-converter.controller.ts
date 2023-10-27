import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';
import { DEFAULT_PAGING } from 'src/stripe-module-config';

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
  ) {}

  // TODO: Does this need auth?
  @Get('product')
  async mapStripeProductToCheckoutWidget(
    @Query('product-id') productId: string,
  ): Promise<ProductResponse> {
    const [stripeProduct, stripePrices, configurationCustomer] = await Promise.all([
      this.stripeClient.products.retrieve(productId),
      this.stripeClient.prices
        .list({
          product: productId,
          active: true,
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.superfluidStripeConverterService.ensureConfigurationCustomer(),
    ]);

    // check eligibility somewhere?

    const config = await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
      configurationCustomer,
      product: stripeProduct,
      prices: stripePrices,
    });

    return { ...config, stripeProduct: stripeProduct };
  }

  @Get('products')
  async products(): Promise<ProductResponse[]> {
    const [stripeProducts, stripePrices, configurationCustomer] = await Promise.all([
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
      this.superfluidStripeConverterService.ensureConfigurationCustomer(),
    ]);

    // check eligibility somewhere?

    const results = await Promise.all(
      stripeProducts.map(async (stripeProduct) => {
        const pricesForProduct = stripePrices.filter((price) => price.product === stripeProduct.id);

        const config = await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
          product: stripeProduct,
          prices: pricesForProduct,
        });

        return { ...config, stripeProduct };
      }),
    );

    return results;
  }
}

const logger = new Logger(SuperfluidStripeConverterController.name);
