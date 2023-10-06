import ConnectKitProvider from '@/components/ConnectKitProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import convertStripeProductToSuperfluidWidget from '@/services/convertStripeProductToSuperfluidWidget';
import Stripe from 'stripe';

const stripeClient = new Stripe(internalConfig.stripeSecretKey, {
  apiVersion: '2023-08-16',
})

export default async function Product({ params }: { params: { product: string } }) {
  // TODO(KK): validate params?

  const productId = params.product;

  const [stripeProduct, { data: stripePrices }] = await Promise.all([
    stripeClient.products.retrieve(productId),
    stripeClient.prices.list({
      product: productId,
      active: true
    })
  ]);

  const config = convertStripeProductToSuperfluidWidget({
    product: stripeProduct,
    prices: stripePrices,
    chainToReceiverAddressMap: internalConfig.chainToReceiverAddressMap,
    currencyToSuperTokenMap: internalConfig.stripeCurrencyToSuperTokenMap
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <WagmiProvider>
        <ConnectKitProvider>
          {!!stripeProduct && !!stripePrices && <SupefluidWidgetProvider productDetails={config.productDetails} paymentDetails={config.paymentDetails} />}
        </ConnectKitProvider>
      </WagmiProvider>
    </main>
  )
} 