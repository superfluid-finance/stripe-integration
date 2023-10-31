import ConnectKitProvider from '@/components/ConnectKitProvider';
import Layout from '@/components/Layout';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { ThemeOptions, ThemeProvider } from '@mui/material';
import { WidgetProps } from '@superfluid-finance/widget';
import { GetServerSideProps } from 'next';
import { use, useEffect, useState } from 'react';
import { paths } from '@/backend-openapi-client';
import createClient from 'openapi-fetch';

type Props = {
  product: string;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
  theme: ThemeOptions
}

export default function Product({ product: productId, ...config }: Props) {
  // TODO(KK): validate params?

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // TODO(KK): handle theme any
  return (
    <Layout themeOptions={config.theme}>
      <WagmiProvider>
        <ConnectKitProvider mode={config.theme.palette?.mode}>
          {!!config && mounted && (
            <SupefluidWidgetProvider
              productId={productId}
              productDetails={config.productDetails}
              paymentDetails={config.paymentDetails}
              theme={config.theme}
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
    </Layout>
  );
}

export const getServerSideProps = (async (context) => {
  const productId = context.query.product as string;

  const client = createClient<paths>({
    baseUrl: internalConfig.getBackendBaseUrl().toString()
  });

  const { response } = await client.GET("/superfluid-stripe-converter/product", {
    params: {
      query: {
        "product-id": productId
      }
    }
  });

  const config = (await response.json()) as {
    productDetails: WidgetProps['productDetails'];
    paymentDetails: WidgetProps['paymentDetails'];
    theme: ThemeOptions;
  };

  return {
    props: {
      product: productId,
      ...config
    }
  }
}) satisfies GetServerSideProps<Props>