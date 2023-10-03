import Image from 'next/image'
import { Inter } from 'next/font/google'
import { FC, useMemo, useState } from 'react';
import WagmiProvider from '@/components/WagmiProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import { useRouter } from 'next/router';
import { useQuery } from 'wagmi';
import Stripe from "stripe";
import useStripeAPI from '@/hooks/useStripeAPI';
import ConnectKitProvider from '@/components/ConnectKitProvider';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { isReady, query } = useRouter();

  const productId = useMemo<string | undefined>(() => {
    if (!isReady)
      return;

    if (typeof query.product !== "string")
      return;

    return query.product
  }, [isReady, query.product]);

  const stripeAPI = useStripeAPI();

  // TODO(KK): To avoid filtering issues then this part should be handled by the back-end API. Or the code should be re-used.

  const { data: stripeProduct } = useQuery(["product", productId], async () => {
    if (!productId) {
      return;
    }

    const product = await stripeAPI.products.retrieve(productId);
    return product;
  }, {
    enabled: !!productId
  });

  const { data: stripePrices } = useQuery(["price", productId], async () => {
    if (!stripeProduct) {
      return;
    }

    const prices = await stripeAPI.prices.list({
      product: productId,
      active: true
    });

    // TODO(KK): check for "is_more"

    return prices.data;
  }, {
    enabled: !!productId
  });

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {/* <WagmiProvider> */}
        <ConnectKitProvider>
          {!!stripeProduct && !!stripePrices && <SupefluidWidgetProvider stripeProduct={stripeProduct} stripePrices={stripePrices} />}
        </ConnectKitProvider>
        {/* </WagmiProvider> */}
      </div>
    </main >
  )
}
