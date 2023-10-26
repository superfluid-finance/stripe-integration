import ConnectKitProvider from '@/components/ConnectKitProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { WidgetProps } from '@superfluid-finance/widget';
import { GetServerSideProps } from 'next';
import { use, useEffect, useState } from 'react';

type Props = {
  product: string;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
}

export default function Product({ product: productId, ...config }: Props) {
  // TODO(KK): validate params?

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider>
      <ConnectKitProvider>
        {!!config && mounted && (
          <SupefluidWidgetProvider
            productId={productId}
            productDetails={config.productDetails}
            paymentDetails={config.paymentDetails}
            personalData={[
              {
                "name": "email",
                "label": "Email",
                "required": {
                  "pattern": "/^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$/g",
                  "message": "Invalid email address"
                }
              },

              //This doesn't work
              // EmailField 
            ]}
          />
        )}
      </ConnectKitProvider>
    </WagmiProvider>
  );
}

export const getServerSideProps = (async (context) => {
  const productId = context.query.product as string;

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

  return {
    props: {
      product: productId,
      ...config
    }
  }
}) satisfies GetServerSideProps<Props>