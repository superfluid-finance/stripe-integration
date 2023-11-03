import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../Link';
import Layout from '@/components/Layout';
import { Button, ThemeOptions } from '@mui/material';
import { GetServerSideProps } from 'next';
import createClient from 'openapi-fetch';
import { paths } from '@/backend-openapi-client';
import internalConfig from '@/internalConfig';
import { LookAndFeelConfig } from './pricing';

type Props = { theme: ThemeOptions };

export default function Home({ theme }: Props) {
  return (
    <Layout themeOptions={theme}>
      <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h2" align="center" color="text.primary" gutterBottom>
            Superfluid ♥ Stripe
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
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
          <Button
            component={Link}
            href="/pricing"
            variant="contained"
            size="large"
            sx={{ width: '200px' }}
          >
            Continue
          </Button>
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
