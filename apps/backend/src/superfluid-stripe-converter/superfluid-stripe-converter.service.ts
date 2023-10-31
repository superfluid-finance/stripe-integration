import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ChainToSuperTokenReceiverMap,
} from './superfluid-stripe-config/chain-to-super-token-receiver-map';
import {
  StripeCurrencyToSuperTokenMap,
} from './superfluid-stripe-config/stripe-currency-to-super-token-map';
import { ChainId, PaymentOption, ProductDetails, WidgetProps } from '@superfluid-finance/widget';
import { currencyDecimalMapping } from 'src/stripe-currencies';
import { Address, formatUnits } from 'viem';
import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import { ChainConfig, IntegrationConfig, SuperfluidStripeConfigService } from './superfluid-stripe-config/superfluid-stripe-config.service';
import { chain } from 'lodash';
import { StripeCurrencyKey } from './superfluid-stripe-config/basic-types';

const GLOBAL_CONFIGURATION_CUSTOMER_EMAIL = "stripe@superfluid.finance"; // This is the key for finding the customer.

const DEFAULT_GLOBAL_CONFIGURATION_CUSTOMER = {
  email: GLOBAL_CONFIGURATION_CUSTOMER_EMAIL,
  name: "Superfluid-Stripe Configuration",
  description: 'This is a "fake" customer for Superfluid-Stripe integration configuration that can be used to configure how the integrations works and looks.',
  metadata:
    {
      theme: `{"palette":{"mode":"light","primary":{"main":"#3f51b5"},"secondary":{"main":"#f50057"}}}`,
    }
} as const satisfies Stripe.CustomerCreateParams;

type Input = {
  product: Stripe.Product;
  prices: Stripe.Price[]; // NOTE: These need to be fetched separately from the Product based on Product ID.
  integrationConfig?: IntegrationConfig;
};

type Output = {
  productDetails: ProductDetails;
  paymentDetails: WidgetProps['paymentDetails'];
  theme: any; // TODO: get rid of any
};

interface StripeProductToWidgetConfigMapper {
  mapStripeProductToWidgetConfig(stripe: Input): Promise<Output>;
}

interface SuperTokenToStripeCurrencyMapper {
  mapSuperTokenToStripeCurrency(superToken: {
    chainId: number;
    address: string;
  }): Promise<StripeCurrencyKey | undefined>;
}

@Injectable()
export class SuperfluidStripeConverterService
  implements
    StripeProductToWidgetConfigMapper,
    SuperTokenToStripeCurrencyMapper
{
  constructor(private readonly stripeConfigService: SuperfluidStripeConfigService) {}

  async mapSuperTokenToStripeCurrency(superToken: {
    chainId: number;
    address: string;
  }): Promise<StripeCurrencyKey | undefined> {
    const stripeConfig = await this.stripeConfigService.loadConfig();
    
    const addressLowerCased = superToken.address.toLowerCase();
    const configEntry = stripeConfig.chains.find(x => x.chainId === superToken.chainId && x.superTokenAddress.toLowerCase() === addressLowerCased);

    if (configEntry) {
      return configEntry.currency;
    }
  }

  async mapStripeProductToWidgetConfig(stripe: Input): Promise<Output> {
    // TODO(KK): Enforce it's a subscription-based product?

    const stripeConfig = await this.stripeConfigService.loadConfig();

    const productDetails: Output['productDetails'] = {
      name: stripe.product.name,
      description: stripe.product.description ?? '', // TODO(KK): Stripe product might not have a description. The Product Card of the widget should still look good.
      imageURI: stripe.product.images.length > 0 ? stripe.product.images[0] : undefined, // TODO(KK): Consider taking in a list of images in the widget and provide a carousel.
    };

    const paymentOptions: PaymentOption[] = [];
    stripe.prices.forEach((p) => {
      if (!p.recurring && p.billing_scheme !== 'per_unit') {
        return; // Not a recurring subscription payment.
        // Anything else regarding recurring to check here?
      }

      const matchingCurrencyConfigs = stripeConfig.chains.filter(x => x.currency === p.currency);
      if (!matchingCurrencyConfigs) {
        return;
      }


      const currencyDecimals = currencyDecimalMapping.get(p.currency.toUpperCase());
      const amount = formatUnits(BigInt(p.unit_amount!), currencyDecimals!) as `${number}`; // TODO: bangs

      for (const { chainId, superTokenAddress, receiverAddress } of matchingCurrencyConfigs) {
        const paymentOption: PaymentOption = {
          chainId: chainId as ChainId, // TODO(KK): Make the widget less annoying with the types here.
          superToken: {
            address: superTokenAddress as Address,
          },
          receiverAddress: receiverAddress as Address,
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

    return {
      productDetails,
      paymentDetails,
      theme: stripeConfig.theme,
    };
  }
}

const logger = new Logger(SuperfluidStripeConverterService.name);
