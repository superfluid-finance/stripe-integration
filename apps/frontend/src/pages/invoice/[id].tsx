import ConnectKitProvider from '@/components/ConnectKitProvider';
import Layout from '@/components/Layout';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import WagmiProvider from '@/components/WagmiProvider';
import internalConfig from '@/internalConfig';
import { ThemeOptions } from '@mui/material';
import { GetServerSideProps } from 'next';
import { paths } from '@/backend-openapi-client';
import createClient from 'openapi-fetch';
import { InvoiceConfig, LookAndFeelConfig } from '../pricing';
import { EmailField } from '@superfluid-finance/widget/utils';

type Props = {
  invoiceConfig: InvoiceConfig;
  theme: ThemeOptions;
};

export default function Invoice({ invoiceConfig, theme }: Props) {
  const { productConfig, stripeInvoice } = invoiceConfig;

  // TODO(KK): handle theme any
  return (
    <Layout themeOptions={theme}>
      <WagmiProvider>
        <ConnectKitProvider mode={theme.palette?.mode}>
          {!!invoiceConfig && (
            <SupefluidWidgetProvider
              productId={invoiceConfig.productConfig.stripeProduct.id}
              productDetails={productConfig.productDetails}
              paymentDetails={productConfig.paymentDetails}
              theme={theme}
              personalData={[
                {
                  ...EmailField,
                  disabled: true,
                  value: stripeInvoice.customer_email ?? '',
                },
              ]}
            />
          )}
        </ConnectKitProvider>
      </WagmiProvider>
    </Layout>
  );
}

export const getServerSideProps = (async (context) => {
  const invoiceId = context.query.id as string;

  const client = createClient<paths>({
    baseUrl: internalConfig.getBackendBaseUrl().toString(),
  });

  const [{ response: invoiceResponse }, { response: lookAndFeelResponse }] = await Promise.all([
    client.GET('/superfluid-stripe-converter/invoice', {
      params: {
        query: {
          'invoice-id': invoiceId,
        },
      },
    }),
    client.GET('/superfluid-stripe-converter/look-and-feel'),
  ]);

  const invoiceConfig = (await invoiceResponse.json()) as InvoiceConfig;
  const { theme } = (await lookAndFeelResponse.json()) as LookAndFeelConfig;

  return {
    props: {
      invoiceConfig,
      theme,
    },
  };
}) satisfies GetServerSideProps<Props>;
