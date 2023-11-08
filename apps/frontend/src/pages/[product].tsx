import ConnectKitProvider from '@/components/ConnectKitProvider';
import Layout from '@/components/Layout';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { Container, IconButton, ThemeOptions } from '@mui/material';
import { GetServerSideProps } from 'next';
import { paths } from '@/backend-openapi-client';
import createClient from 'openapi-fetch';
import { LookAndFeelConfig, ProductConfig } from './pricing';
import { EmailWithAliasField } from '@superfluid-finance/widget/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from '@/Link';

type Props = {
  productConfig: ProductConfig;
  theme: ThemeOptions;
};

export default function Product({ productConfig, theme }: Props) {
  // TODO(KK): validate params?

  // TODO(KK): handle theme any
  return (
    <Layout themeOptions={theme}>
      {/* TODO(KK): check if pricing table is enabled */}

      <Container sx={{ mb: 2.5 }}>
        <IconButton
          LinkComponent={Link}
          href="/pricing"
          title="Back"
          edge="start"
          size="large"
          sx={(theme) => ({ color: theme.palette.text.secondary })}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Container>

      <WagmiProvider>
        <ConnectKitProvider mode={theme.palette?.mode}>
          {!!productConfig && (
            <SupefluidWidgetProvider
              productId={productConfig.stripeProduct.id}
              productDetails={productConfig.productDetails}
              paymentDetails={productConfig.paymentDetails}
              theme={theme}
              personalData={[EmailWithAliasField]}
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
