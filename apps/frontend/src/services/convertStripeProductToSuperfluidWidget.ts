import Stripe from 'stripe';
import { PaymentDetails, PaymentOption, ProductDetails, WidgetProps } from '@superfluid-finance/widget';
import { Address } from 'wagmi';
import {
  ChainToReceiverAddressMap,
  StripeCurrentToSuperTokenMap as StripeCurrencyToSuperTokenMap,
} from '@/internalConfig';

type Input = {
  product: Stripe.Product;
  prices: Stripe.Price[]; // NOTE: These need to be fetched separately from the Product based on Product ID.

  // TODO(KK): Separate from this object.
  chainToReceiverAddressMap: ChainToReceiverAddressMap;
  currencyToSuperTokenMap: StripeCurrencyToSuperTokenMap;
};

type Output = {
  productDetails: ProductDetails;
  paymentDetails: WidgetProps['paymentDetails'];
};

export default function convertStripeProductToSuperfluidWidget(stripe: Input): Output {
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
    const superTokenMap = stripe.currencyToSuperTokenMap.get(p.currency);
    if (!superTokenMap) {
      return;
    }

    for (const [chainId, superTokenAddress] of Array.from(superTokenMap)) {
      const receiverAddress = stripe.chainToReceiverAddressMap.get(chainId);
      if (!receiverAddress) {
        return;
      }

      const paymentOption: PaymentOption = {
        chainId: chainId as 5, // TODO(KK): Make the widget less annoying with the types here.
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
