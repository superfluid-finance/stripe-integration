import { ThemeOptions } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Layout from '@/components/Layout';
import { GetServerSideProps } from 'next';
import createClient from 'openapi-fetch';
import { paths } from '@/backend-openapi-client';
import internalConfig from '@/internalConfig';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from 'stripe';
import { useMemo } from 'react';

type Tier = {
  title: string;
  price: string;
  description: string[];
  buttonText: string;
  buttonVariant: string;
  productId: string;
};

export type ProductConfig = {
  stripeProduct: Stripe.Product;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
};

export type LookAndFeelConfig = { theme: ThemeOptions };

type Props = {
  productConfigs: ProductConfig[];
  theme: ThemeOptions;
};

export default function Pricing({ productConfigs, theme }: Props) {
  const tiers = useMemo<Tier[]>(
    () =>
      productConfigs.map((x) => {
        const price = x.stripeProduct.default_price as Stripe.Price | null;
        return ({
          title: x.stripeProduct.name,
          description: x.stripeProduct.features.map((f) => f.name),
          price: price && price.unit_amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.unit_amount) : "",
          buttonText: 'Get Started',
          buttonVariant: 'contained',
          productId: x.stripeProduct.id,
        });
      }),
    [productConfigs],
  );

  return (
    <Layout themeOptions={theme}>
      {/* Hero unit */}
      <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
        <Typography component="h1" variant="h2" align="center" color="text.primary" gutterBottom>
          Pricing
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" component="p">
          Quickly build an effective pricing table for your potential customers with this layout.
          It&apos;s built with default MUI components with little customization.
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          {tiers.map((tier) => (
            // Enterprise card is full width at sm breakpoint
            <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 6} md={4}>
              <Card>
                <CardHeader
                  title={tier.title}
                  // subheader={tier.subheader}
                  titleTypographyProps={{ align: 'center' }}
                  action={tier.title === 'Pro' ? <StarIcon /> : null}
                  subheaderTypographyProps={{
                    align: 'center',
                  }}
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[700],
                  }}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >
                    <Typography component="h2" variant="h3" color="text.primary">
                      {tier.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      /mo
                    </Typography>
                  </Box>
                  <ul>
                    {tier.description.map((line) => (
                      <Typography
                        component="li"
                        variant="subtitle1"
                        align="center"
                        key={line}
                        dangerouslySetInnerHTML={{ __html: line }}
                      >
                        {/* TODO(KK): clean up */}
                        {/* {line} */}
                      </Typography>
                    ))}
                  </ul>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                    href={`${tier.productId}`}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = (async (context) => {
  const productId = context.query.product as string;

  const client = createClient<paths>({
    baseUrl: internalConfig.getBackendBaseUrl().toString(),
  });

  const [{ response: productsResponse }, { response: lookAndFeelResponse }] = await Promise.all([
    client.GET('/superfluid-stripe-converter/products', {
      params: {
        query: {
          'product-id': productId,
        },
      },
    }),
    client.GET('/superfluid-stripe-converter/look-and-feel'),
  ]);

  // TODO(KK): type the .json responses better

  const productConfigs = (await productsResponse.json()) as ProductConfig[];
  const { theme } = (await lookAndFeelResponse.json()) as LookAndFeelConfig;

  return {
    props: {
      productConfigs,
      theme,
    },
  };
}) satisfies GetServerSideProps<Props>;
