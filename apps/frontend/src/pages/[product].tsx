import ConnectKitProvider from '@/components/ConnectKitProvider';
import Layout from '@/components/Layout';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import {
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  ThemeOptions,
  Toolbar,
} from '@mui/material';
import { WidgetProps } from '@superfluid-finance/widget';
import { GetServerSideProps } from 'next';
import { use, useEffect, useState } from 'react';
import { paths } from '@/backend-openapi-client';
import createClient from 'openapi-fetch';
import { LookAndFeelConfig, ProductConfig } from './pricing';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextLink from 'next/link';

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
      <Container sx={{ mb: 2.5 }}>
        <Button component={NextLink} href="/pricing" color="primary" startIcon={<ArrowBackIcon />}>
          Back to products
        </Button>
      </Container>

      <WagmiProvider>
        <ConnectKitProvider mode={theme.palette?.mode}>
          {!!productConfig && mounted && (
            <SupefluidWidgetProvider
              productId={productConfig.stripeProduct.id}
              productDetails={productConfig.productDetails}
              paymentDetails={productConfig.paymentDetails}
              theme={theme}
              personalData={[
                {
                  name: 'email',
                  label: 'Email',
                  required: {
                    pattern: '/^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$/g',
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
