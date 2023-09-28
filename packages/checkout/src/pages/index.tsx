import Image from 'next/image'
import { Inter } from 'next/font/google'
import { WagmiConfig, createConfig } from "wagmi";
import SuperfluidWidget, { EventListeners, WalletManager, supportedNetworks } from "@superfluid-finance/widget";
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig, useModal } from "connectkit";
import { FC, useMemo, useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

const wagmiConfig = createConfig(
  getDefaultConfig({
    // Required API Keys
    // alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: "952483bf7a0f5ace4c40eb53967f1368",

    // Required
    appName: "Your App Name",

    // Optional
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)

    autoConnect: true,
    chains: supportedNetworks,
  }),
);

export default function Home() {
  const [initialChainId, setInitialChainId] = useState<number | undefined>();

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <WagmiConfig config={wagmiConfig}>
          <ConnectKitProvider options={{
            initialChainId
          }}>
            <WidgetProvider setInitialChainId={setInitialChainId} />
          </ConnectKitProvider>
        </WagmiConfig>
      </div>
    </main>
  )
}

const WidgetProvider: FC<{
  setInitialChainId: (chainId: number | undefined) => void;
}> = ({ setInitialChainId }) => {
  const { open, setOpen } = useModal();

  const walletManager = useMemo<WalletManager>(() => ({
    isOpen: open,
    open: () => setOpen(true)
  }), [open, setOpen]);

  const eventListeners = useMemo<EventListeners>(() => ({
    onPaymentOptionUpdate: (paymentOption) => setInitialChainId(paymentOption?.chainId)
  }), [setInitialChainId]);

  return (<SuperfluidWidget type="drawer" walletManager={walletManager} eventListeners={eventListeners} paymentDetails={{
    paymentOptions: {
      chainId: 1,
      receiverAddress: "0x7269B0c7C831598465a9EB17F6c5a03331353dAF",
      superToken: { address: "0xC22BeA0Be9872d8B7B3933CEc70Ece4D53A900da" }
    }
  }} >{({ openModal }) => (<button onClick={openModal}>Widget</button>)}
  </SuperfluidWidget>);
}
