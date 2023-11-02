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
import { InvoiceConfig, LookAndFeelConfig, ProductConfig } from '../pricing';

type Props = {
  invoiceConfig: InvoiceConfig;
  theme: ThemeOptions;
};

export default function Invoice({ invoiceConfig, theme }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { productConfig, stripeInvoice } = invoiceConfig;

  console.log(invoiceConfig);

  // TODO(KK): handle theme any
  return (
    <Layout themeOptions={theme}>
      <WagmiProvider>
        <ConnectKitProvider mode={theme.palette?.mode}>
          {!!invoiceConfig && mounted && (
            <SupefluidWidgetProvider
              productId={invoiceConfig.productConfig.stripeProduct.id}
              productDetails={productConfig.productDetails}
              paymentDetails={productConfig.paymentDetails}
              theme={theme}
              personalData={[
                {
                  name: 'email',
                  label: 'Email',
                  disabled: true,
                  required: {
                    pattern: '/^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$/g',
                    message: 'Invalid email address',
                  },
                  value: stripeInvoice.customer_email ?? '',
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
