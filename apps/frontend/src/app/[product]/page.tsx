import ConnectKitProvider from '@/components/ConnectKitProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { WidgetProps } from '@superfluid-finance/widget';

export default async function Product({ params }: { params: { product: string } }) {
  // TODO(KK): validate params?

  const productId = params.product;

  const url = new URL(`/stripe-to-superfluid/checkout-widget?product-id=${productId}`, internalConfig.getBackendBaseUrl());
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const config = (await response.json()) as {
    productDetails: WidgetProps['productDetails'];
    paymentDetails: WidgetProps['paymentDetails'];
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <WagmiProvider>
        <ConnectKitProvider>
          {!!config && (
            <SupefluidWidgetProvider
              productId={productId}
              productDetails={config.productDetails}
              paymentDetails={config.paymentDetails}
              personalData={[
                {
                  label: 'Email',
                  required: {
                    pattern:
                      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.toString(),
                    message: 'Invalid email address',
                  },
                },

                //This doesn't work
                // EmailField
              ]}
            />
          )}
        </ConnectKitProvider>
      </WagmiProvider>
    </main>
  );
}
