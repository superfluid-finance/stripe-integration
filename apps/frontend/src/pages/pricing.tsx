import { paths } from '@/backend-openapi-client';
import Layout from '@/components/Layout';
import internalConfig from '@/internalConfig';
import StarIcon from '@mui/icons-material/StarBorder';
import { List, ListItem, ListItemText, Stack, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { ThemeOptions } from '@mui/material/styles';
import { WidgetProps } from '@superfluid-finance/widget';
import { GetServerSideProps } from 'next';
import createClient from 'openapi-fetch';
import { FC, useMemo } from 'react';
import Stripe from 'stripe';
import { currencyDecimalMapping } from '@/stripe-currencies';
import Link from '@/Link';
import CheckIcon from '@mui/icons-material/Check';
import { green } from '@mui/material/colors';

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

export type InvoiceConfig = {
  stripeInvoice: Stripe.Invoice;
  productConfig: ProductConfig;
};

export type LookAndFeelConfig = { theme: ThemeOptions };

type Props = {
  productConfigs: ProductConfig[];
  theme: ThemeOptions;
};

const TierCard: FC<{ tier: Tier }> = ({ tier }) => {
  const theme = useTheme();

  // Enterprise card is full width at sm breakpoint
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'calc((100% - 40px) / 3)',
        width: '100%',
        [theme.breakpoints.down('md')]: { maxWidth: 'calc((100% - 20px) / 2)' },
        [theme.breakpoints.down('sm')]: { maxWidth: '100%' },
      }}
    >
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
            theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
        }}
      />
      <CardContent sx={{ flex: 1 }}>
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
        <List dense>
          {tier.description.map((line) => (
            <ListItem key={line} disableGutters>
              <Box px={2}>
                <CheckIcon fontSize="small" sx={{
                  color: green[600]
                }} />
              </Box>
              <ListItemText primary={line} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions>
        <Button
          LinkComponent={Link}
          href={`/${tier.productId}`}
          fullWidth
          variant={tier.buttonVariant as 'outlined' | 'contained'}
        >
          {tier.buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

export default function Pricing({ productConfigs, theme }: Props) {
  // TODO(KK): Order by price
  const tiers = useMemo<Tier[]>(
    () =>
      productConfigs.map((x) => {
        const stripePrice = x.stripeProduct.default_price as Stripe.Price | null;

        let priceString = ""
        if (stripePrice && stripePrice.unit_amount) {
          const currencyDecimals = currencyDecimalMapping.get(stripePrice.currency.toUpperCase())!;
          const value = stripePrice.unit_amount / Math.pow(10, currencyDecimals);
          priceString = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: stripePrice.currency,
          }).format(value)
        }

        return {
          title: x.stripeProduct.name,
          description: x.stripeProduct.features.map((f) => f.name),
          price: priceString,
          buttonText: 'Get Started',
          buttonVariant: 'contained',
          productId: x.stripeProduct.id,
        };
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
        <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
          Quickly build an effective pricing table for your potential customers with this layout.
          It&apos;s built with default MUI components with little customization.
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="stretch"
          justifyContent="center"
          rowGap={4}
          columnGap={2.5}
        >
          {tiers.map((tier) => (
            <TierCard key={tier.title} tier={tier} />
          ))}
        </Stack>
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
