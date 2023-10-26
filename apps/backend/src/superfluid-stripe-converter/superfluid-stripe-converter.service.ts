import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ChainToSuperTokenReceiverMap,
  defaultChainToSuperTokenReceiverMap,
} from './price-conversion-strategy/chain-to-super-token-receiver-map';
import {
  StripeCurrencyToSuperTokenMap,
  defaultStripeCurrencyToSuperTokenMap,
} from './price-conversion-strategy/stripe-currency-to-super-token-map';
import { ChainId, PaymentOption, ProductDetails, WidgetProps } from '@superfluid-finance/widget';
import { currencyDecimalMapping } from 'src/stripe-currencies';
import { formatUnits } from 'viem';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { DEFAULT_PAGING } from 'src/stripe-module-config';

const configurationCustomerEmail = 'auto-generated@superfluid.finance' as const;

type Input = {
  product: Stripe.Product;
  prices: Stripe.Price[]; // NOTE: These need to be fetched separately from the Product based on Product ID.
};

type Output = {
  productDetails: ProductDetails;
  paymentDetails: WidgetProps['paymentDetails'];
  theme: any; // TODO: get rid of any
};

interface StripeProductToWidgetConfigMapper {
  mapStripeProductToWidgetConfig(stripe: Input): Promise<Output>;
}

type PriceId = string;
interface SuperTokenToStripeCurrencyMapper {
  mapSuperTokenToStripeCurrency(superToken: {
    chainId: number;
    address: string;
  }): PriceId | undefined;
}

interface ConfigurationCustomerManager {
  ensureConfigurationCustomer(): Promise<Stripe.Customer>;
}

@Injectable()
export class SuperfluidStripeConverterService
  implements
    StripeProductToWidgetConfigMapper,
    SuperTokenToStripeCurrencyMapper,
    ConfigurationCustomerManager
{
  // TODO(KK): Inject
  private readonly chainToSuperTokenReceiverMap = defaultChainToSuperTokenReceiverMap;
  private readonly stripeCurrencyToSuperTokenMap = defaultStripeCurrencyToSuperTokenMap;

  constructor(@InjectStripeClient() private readonly stripeClient: Stripe) {}

  async ensureConfigurationCustomer(): Promise<Stripe.Customer> {
    // TODO: caching
    // TODO: use better constants

    let configurationCustomer: Stripe.Customer;

    const customers = await this.stripeClient.customers
      .list({
        email: configurationCustomerEmail,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    if (customers.length === 1) {
      configurationCustomer = customers[0];
    } else if (customers.length === 0) {
      configurationCustomer = await this.stripeClient.customers.create({
        email: configurationCustomerEmail,
        metadata: {
          note: 'Auto-generated. Be careful when editing!',
          theme: `{"palette":{"mode":"light","primary":{"main":"#3f51b5"},"secondary":{"main":"#f50057"}}}`,
        },
      });
    } else {
      throw new Error(
        `There should not be more than one Superfluid-Stripe configuration customer. Please remove one of the customers with e-mail: [${configurationCustomerEmail}]`,
      );
    }

    return configurationCustomer;
  }

  mapSuperTokenToStripeCurrency(superToken: {
    chainId: number;
    address: string;
  }): PriceId | undefined {
    for (const [stripeCurrency, superTokens] of Array.from(this.stripeCurrencyToSuperTokenMap)) {
      for (const { chainId, address: superTokenAddress } of superTokens) {
        if (
          superToken.chainId === chainId &&
          superToken.address.toLowerCase() === superTokenAddress.toLowerCase()
        ) {
          return stripeCurrency;
        }
      }
    }

    return undefined;
  }

  async mapStripeProductToWidgetConfig(stripe: Input): Promise<Output> {
    // TODO(KK): Enforce it's a subscription-based product?

    const configurationCustomer = await this.ensureConfigurationCustomer();

    const productDetails: Output['productDetails'] = {
      name: stripe.product.name,
      description: stripe.product.description ?? '', // TODO(KK): Stripe product might not have a description. The Product Card of the widget should still look good.
      imageURI: stripe.product.images.length > 0 ? stripe.product.images[0] : undefined, // TODO(KK): Consider taking in a list of images in the widget and provide a carousel.
    };

    // TODO(KK): How to solve chain ID? Where do I retrieve it from?
    // I'm thinking to create a map for Stripe payment options to crypto payment options. The merchant can choose the network.
    const paymentOptions: PaymentOption[] = [];
    stripe.prices.forEach((p) => {
      const superTokens = this.stripeCurrencyToSuperTokenMap.get(p.currency);
      if (!superTokens) {
        return;
      }

      if (!p.recurring && p.billing_scheme !== 'per_unit') {
        return; // Not a recurring subscription payment.
        // Anything else regarding recurring to check here?
      }

      const currencyDecimals = currencyDecimalMapping.get(p.currency.toUpperCase());
      const amount = formatUnits(BigInt(p.unit_amount!), currencyDecimals!) as `${number}`; // TODO: bangs

      for (const { chainId, address: superTokenAddress } of superTokens) {
        const receiverAddress = this.chainToSuperTokenReceiverMap.get(chainId);
        if (!receiverAddress) {
          continue;
        }

        const paymentOption: PaymentOption = {
          chainId: chainId as ChainId, // TODO(KK): Make the widget less annoying with the types here.
          superToken: {
            address: superTokenAddress,
          },
          receiverAddress,
          flowRate: {
            amountEther: amount,
            period: p.recurring!.interval,
          },
          transferAmountEther: amount,
        };
        paymentOptions.push(paymentOption);
      }
    });

    const paymentDetails: Output['paymentDetails'] = {
      paymentOptions,
    };

    // TODO: use Zod for validation?
    // TODO: get rid of any
    let theme: any;
    try {
      theme = JSON.parse(configurationCustomer.metadata['theme']);
    } catch (e) {
      logger.error(e);
    }

    logger.debug('theme');
    logger.debug(theme);

    return {
      productDetails,
      paymentDetails,
      theme,
    };
  }
}

const logger = new Logger(SuperfluidStripeConverterService.name);
