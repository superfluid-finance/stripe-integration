import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ChainToSuperTokenReceiverMap,
  defaultChainToSuperTokenReceiverMap,
} from './price-conversion-strategy/ChainToSuperTokenReceiverMap';
import {
  StripeCurrencyToSuperTokenMap,
  defaultStripeCurrencyToSuperTokenMap,
} from './price-conversion-strategy/StripeCurrencyToSuperTokenMap';
import { ChainId, PaymentOption, ProductDetails, WidgetProps } from '@superfluid-finance/widget';
import { currencyDecimalMapping } from 'src/currencies';
import { formatUnits } from 'viem';

type Input = {
  product: Stripe.Product;
  prices: Stripe.Price[]; // NOTE: These need to be fetched separately from the Product based on Product ID.
};

type Output = {
  productDetails: ProductDetails;
  paymentDetails: WidgetProps['paymentDetails'];
};

interface StripeProductToWidgetConfigMapper {
  mapStripeProductToWidgetConfig(stripe: Input): Output;
}

type PriceId = string;
interface SuperTokenToStripeCurrencyMapper {
  mapSuperTokenToStripeCurrency(superToken: {
    chainId: number;
    address: string;
  }): PriceId | undefined;
}

@Injectable()
export class StripeToSuperfluidService
  implements StripeProductToWidgetConfigMapper, SuperTokenToStripeCurrencyMapper
{
  // TODO(KK): Inject
  public readonly chainToSuperTokenReceiverMap = defaultChainToSuperTokenReceiverMap;
  public readonly stripeCurrencyToSuperTokenMap = defaultStripeCurrencyToSuperTokenMap;

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

  mapStripeProductToWidgetConfig(stripe: Input): Output {
    // TODO(KK): Enforce it's a subscription-based product?

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

    return {
      productDetails,
      paymentDetails,
    };
  }
}

const logger = new Logger(StripeToSuperfluidService.name);
