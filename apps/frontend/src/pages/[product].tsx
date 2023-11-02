import ConnectKitProvider from '@/components/ConnectKitProvider';
import Layout from '@/components/Layout';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { ThemeOptions } from '@mui/material';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { paths } from '@/backend-openapi-client';
import createClient from 'openapi-fetch';
import { LookAndFeelConfig, ProductConfig } from './pricing';
import { EmailField } from '@superfluid-finance/widget/utils';

type Props = {
  productConfig: ProductConfig;
  theme: ThemeOptions;
};

export default function Product({ productConfig, theme }: Props) {
  // TODO(KK): validate params?

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // TODO(KK): handle theme any
  return (
    <Layout themeOptions={theme}>
      <WagmiProvider>
        <ConnectKitProvider mode={theme.palette?.mode}>
          {!!productConfig && mounted && (
            <SupefluidWidgetProvider
              productId={productConfig.stripeProduct.id}
              productDetails={productConfig.productDetails}
              paymentDetails={productConfig.paymentDetails}
              theme={theme}
              personalData={[EmailField]}
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
    baseUrl: internalConfig.getBackendBaseUrl().toString(),
  });

  const [{ response: productResponse }, { response: lookAndFeelResponse }] = await Promise.all([
    client.GET('/superfluid-stripe-converter/product', {
      params: {
        query: {
          'product-id': productId,
        },
      },
    }),
    client.GET('/superfluid-stripe-converter/look-and-feel'),
  ]);

  const productConfig = (await productResponse.json()) as ProductConfig;
  const { theme } = (await lookAndFeelResponse.json()) as LookAndFeelConfig;

  return {
    props: {
      productConfig,
      theme,
    },
  };
}) satisfies GetServerSideProps<Props>;
