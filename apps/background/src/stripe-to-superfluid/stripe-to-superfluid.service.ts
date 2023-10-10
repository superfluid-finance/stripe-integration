import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ChainToSuperTokenReceiverMap, defaultChainToSuperTokenReceiverMap } from './core/ChainToSuperTokenReceiverMap';
import { StripeCurrencyToSuperTokenMap, defaultStripeCurrencyToSuperTokenMap } from './core/StripeCurrencyToSuperTokenMap';
import { ChainId, PaymentOption, ProductDetails, WidgetProps } from '@superfluid-finance/widget';

type Input = {
  product: Stripe.Product;
  prices: Stripe.Price[]; // NOTE: These need to be fetched separately from the Product based on Product ID.
};

type Output = {
  productDetails: ProductDetails;
  paymentDetails: WidgetProps['paymentDetails'];
};

@Injectable()
export class StripeToSuperfluidService {

  // TODO(KK): Inject
  private readonly chainToSuperTokenReceiverMap = defaultChainToSuperTokenReceiverMap;
  private readonly stripeCurrencyToSuperTokenMap = defaultStripeCurrencyToSuperTokenMap;

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
      const superTokenMap = this.stripeCurrencyToSuperTokenMap.get(p.currency);
      if (!superTokenMap) {
        return;
      }

      for (const [chainId, superTokenAddress] of Array.from(superTokenMap)) {
        const receiverAddress = this.chainToSuperTokenReceiverMap.get(chainId);
        if (!receiverAddress) {
          return;
        }

        const paymentOption: PaymentOption = {
          chainId: chainId as ChainId, // TODO(KK): Make the widget less annoying with the types here.
          superToken: {
            address: superTokenAddress,
          },
          receiverAddress,
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