import ConnectKitProvider from '@/components/ConnectKitProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import { backendBaseUrl } from '@/pages/api/create-session';
import { EmailField, WidgetProps } from '@superfluid-finance/widget';

export default async function Product({ params }: { params: { product: string } }) {
  // TODO(KK): validate params?

  const productId = params.product;

  const url = new URL(
    `/stripe-to-superfluid/checkout-widget?product-id=${productId}`,
    backendBaseUrl,
  );
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
              paymentDetails={{
                ...config.paymentDetails,
                paymentOptions: [
                  {
                    receiverAddress: '0xf26ce9749f29e61c25d0333bce2301cb2dfd3a22',
                    chainId: 5,
                    superToken: {
                      address: '0xf2d68898557ccb2cf4c10c3ef2b034b2a69dad00',
                    },
                    flowRate: {
                      amountEther: '1',
                      period: 'month',
                    },
                  },
                ],
              }}
              personalData={[
                // This works
                {
                  label: 'Email',
                  required: {
                    pattern:
                      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.toString(),
                    message: 'Please enter a valid email address',
                  },
                },
                // This doesn't
                // EmailField,
              ]}
            />
          )}
        </ConnectKitProvider>
      </WagmiProvider>
    </main>
  );
}
