import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../Link';
import Layout from '@/components/Layout';
import { ThemeOptions } from '@mui/material';
import { GetServerSideProps } from 'next';
import createClient from 'openapi-fetch';
import { paths } from '@/backend-openapi-client';
import internalConfig from '@/internalConfig';
import { LookAndFeelConfig } from './pricing';

type Props = { theme: ThemeOptions };

export default function Home({ theme }: Props) {
  return (
    <Layout themeOptions={theme}>
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h3" align="center" color="text.primary" gutterBottom>
            Superfluid ♥ Stripe
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" component="p">
            The Superfluid-Stripe Integration provides a bridge between the conventional and the
            progressive world of digital finance, refining the process of managing
            subscription-based services.
          </Typography>
        </Box>
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Link align="center" href="/pricing">
            Pricing Table
          </Link>
        </Box>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = (async () => {
  const client = createClient<paths>({
    baseUrl: internalConfig.getBackendBaseUrl().toString(),
  });

  const { response } = await client.GET('/superfluid-stripe-converter/look-and-feel');

  const props = (await response.json()) as LookAndFeelConfig;

  return {
    props,
  };
}) satisfies GetServerSideProps<Props>;
