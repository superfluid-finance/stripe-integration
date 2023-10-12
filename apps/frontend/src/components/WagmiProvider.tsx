"use client"

import { WagmiConfig, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import publicConfig from '@/publicConfig';
import { PropsWithChildren } from "react";
import { supportedNetworks } from "@superfluid-finance/widget";

const wagmiConfig = createConfig(
    getDefaultConfig({
        // Required API Keys
        // alchemyId: process.env.ALCHEMY_ID, // or infuraId
        walletConnectProjectId: publicConfig.walletConnectProjectId,

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

export default function WagmiProvider({ children }: PropsWithChildren) {
    return <WagmiConfig config={wagmiConfig}>
        {children}</WagmiConfig>
} 