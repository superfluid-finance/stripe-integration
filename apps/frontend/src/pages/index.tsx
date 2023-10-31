import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '../Link';
import theme from '../theme';
import Layout from '@/components/Layout';

export default function Home() {
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
          <Typography
            component="h1"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Superfluid ♥ Stripe
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" component="p">
            The Superfluid-Stripe Integration provides a bridge between the conventional and the progressive world of digital finance, refining the process of managing subscription-based services.
          </Typography>
        </Box>
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: "100%"
          }}
        >
          <Link align="center" href="/pricing">Pricing Table</Link>
        </Box>
      </Container>
    </Layout>
  );
}
