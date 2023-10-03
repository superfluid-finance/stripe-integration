import Image from 'next/image'
import { Inter } from 'next/font/google'
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig, useModal } from "connectkit";
import { FC, useMemo, useState } from 'react';
import WagmiProvider from '@/components/WagmiProvider';
import SupefluidWidgetProvider from '@/components/SuperfluidWidgetProvider';
import { useRouter } from 'next/router';
import { useQuery } from 'wagmi';
import Stripe from "stripe";

const inter = Inter({ subsets: ['latin'] })



export default function Home() {
  const [initialChainId, setInitialChainId] = useState<number | undefined>();

  const { isReady, query } = useRouter();

  const productId = useMemo<string | undefined>(() => {
    if (!isReady)
      return;

    if (typeof query.product !== "string")
      return;

    return query.product
  }, [isReady, query.product]);

  // const { } = useQuery([productId], async () => {
  //   stripe
  // });

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <ConnectKitProvider options={{
          initialChainId
        }}>
          {/* <SupefluidWidgetProvider setInitialChainId={setInitialChainId} /> */}
        </ConnectKitProvider>
      </div>
    </main>
  )
}
