import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { SuperfluidStripeConverterService } from './superfluid-stripe-converter.service';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import {
  LookAndFeelConfig,
  SuperfluidStripeConfigService,
} from './superfluid-stripe-config/superfluid-stripe-config.service';

type StripeProductWithPriceExpanded = Stripe.Product & {
  default_price: Stripe.Price
}

type ProductResponse = {
  stripeProduct: Stripe.Product;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
};

type InvoiceResponse = {
  stripeInvoice: Stripe.Invoice;
  productConfig: ProductResponse;
};

type ProductsResponse = (ProductResponse & {
  stripeProduct: StripeProductWithPriceExpanded
})[]

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
    const [stripeProduct, stripePrices, blockchainConfig] = await Promise.all([
      this.stripeClient.products.retrieve(productId),
      this.stripeClient.prices
        .list({
          product: productId,
          active: true
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.superfluidStripeConfigService.loadOrInitializeBlockchainConfig(),
    ]);

    // check eligibility somewhere?

    const wigetConfig = await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
      preloadedBlockchainConfig: blockchainConfig,
      product: stripeProduct,
      prices: stripePrices,
    });

    return { ...wigetConfig, stripeProduct };
  }

  @Get('products')
  async products(): Promise<ProductsResponse> {
    const [stripeProducts_, stripePrices, blockchainConfig] = await Promise.all([
      this.stripeClient.products
        .list({
          active: true,
          expand: ["data.default_price"]
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.stripeClient.prices
        .list({
          active: true,
        })
        .autoPagingToArray(DEFAULT_PAGING),
      this.superfluidStripeConfigService.loadOrInitializeCompleteConfig(),
    ]);

    const stripeProducts = stripeProducts_ as StripeProductWithPriceExpanded[];

    // check eligibility somewhere?

    const results = await Promise.all(
      stripeProducts.map(async (stripeProduct) => {
        const pricesForProduct = stripePrices.filter((price) => price.product === stripeProduct.id);

        const widgetConfig =
          await this.superfluidStripeConverterService.mapStripeProductToWidgetConfig({
            preloadedBlockchainConfig: blockchainConfig,
            product: stripeProduct,
            prices: pricesForProduct,
          });

        return { ...widgetConfig, stripeProduct };
      }),
    );

    return results;
  }

  // TODO(KK): cache aggressively
  @Get('look-and-feel')
  async lookAndFeel(): Promise<LookAndFeelConfig> {
    const lookAndFeelConfig =
      await this.superfluidStripeConfigService.loadOrInitializeLookAndFeelConfig();
    return lookAndFeelConfig;
  }

  @Get('invoice')
  async invoice(@Query('invoice-id') invoiceId: string): Promise<InvoiceResponse> {
    const stripeInvoice = await this.stripeClient.invoices.retrieve(invoiceId);
    const product = await this.stripeClient.products.retrieve(
      stripeInvoice.lines.data[0].price?.product as string,
    );

    const productConfig = await this.mapStripeProductToCheckoutWidget(product.id);

    return {
      stripeInvoice,
      productConfig,
    };
  }
}

const logger = new Logger(SuperfluidStripeConverterController.name);
