import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import Layout from '@/components/Layout';
import { GetServerSideProps } from 'next';
import createClient from 'openapi-fetch';
import { paths } from '@/backend-openapi-client';
import internalConfig from '@/internalConfig';
import { WidgetProps } from '@superfluid-finance/widget';
import Stripe from "stripe";
import { useEffect, useMemo } from 'react';

type Tier = {
    title: string;
    price: string;
    description: string[];
    buttonText: string;
    buttonVariant: string;
    productId: string
}

// TODO(KK): anys
type Props = {
    products: {
        stripeProduct: Stripe.Product,
        productDetails: WidgetProps['productDetails'],
        paymentDetails: WidgetProps['paymentDetails'],
        theme: ThemeOptions
    }[],
}

export default function Pricing({
    products
}: Props) {
    const tiers = useMemo<Tier[]>(() => products.map(p => ({
        title: p.stripeProduct.name,
        description: p.stripeProduct.features.map(f => f.name),
        price: "X",
        buttonText: "Get Started",
        buttonVariant: "contained",
        productId: p.stripeProduct.id
    })), [products]);

    return (
        <Layout themeOptions={products[0]?.theme}>
            {/* Hero unit */}
            < Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="text.primary"
                    gutterBottom
                >
                    Pricing
                </Typography>
                <Typography variant="h5" align="center" color="text.secondary" component="p">
                    Quickly build an effective pricing table for your potential customers with
                    this layout. It&apos;s built with default MUI components with little
                    customization.
                </Typography>
            </ Container>
            {/* End hero unit */}
            < Container maxWidth="md" component="main" >
                <Grid container spacing={5} alignItems="flex-end">
                    {tiers.map((tier) => (
                        // Enterprise card is full width at sm breakpoint
                        <Grid
                            item
                            key={tier.title}
                            xs={12}
                            sm={tier.title === 'Enterprise' ? 12 : 6}
                            md={4}
                        >
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
                                            ${tier.price}
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
            </ Container>
        </Layout >
    );
}

export const getServerSideProps = (async (context) => {
    const productId = context.query.product as string;

    const client = createClient<paths>({
        baseUrl: internalConfig.getBackendBaseUrl().toString()
    });

    const { response } = await client.GET("/superfluid-stripe-converter/products", {
        params: {
            query: {
                "product-id": productId
            }
        }
    });

    // TODO(KK): type the .json responses better

    const configs = (await response.json()) as {
        stripeProduct: Stripe.Product,
        productDetails: WidgetProps['productDetails'];
        paymentDetails: WidgetProps['paymentDetails'];
        theme: ThemeOptions;
    }[];

    return {
        props: {
            products: configs
        }
    }
}) satisfies GetServerSideProps<Props>