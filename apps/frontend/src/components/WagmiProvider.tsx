import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import publicConfig from '@/publicConfig';
import { PropsWithChildren } from "react";
import { supportedNetworks } from "@superfluid-finance/widget";
import superfluidMetadata from "@superfluid-finance/widget/metadata";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const superfluidRpcUrls = superfluidMetadata.networks.reduce(
    (acc, network) => {
        acc[
            network.chainId
        ] = `https://rpc-endpoints.superfluid.dev/${network.name}`;
        return acc;
    },
    {} as Record<number, string>,
);

const { chains, publicClient } = configureChains(
    supportedNetworks,
    [
        jsonRpcProvider({
            rpc: (chain) => {
                const rpcURL =
                    superfluidRpcUrls[chain.id as keyof typeof superfluidRpcUrls];

                if (!rpcURL) {
                    return null;
                }

                return {
                    http: rpcURL,
                };
            },
        }),
    ]
);

const wagmiConfig = createConfig(
    getDefaultConfig({
        // Required API Keys
        // alchemyId: process.env.ALCHEMY_ID, // or infuraId
        walletConnectProjectId: publicConfig.walletConnectProjectId,

        // TODO(KK): Take these as inputs?

        // Required
        appName: "Your App Name",

        // Optional
        appDescription: "Your App Description",
        appUrl: "https://family.co", // your app's url
        appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)

        autoConnect: true,
        chains: chains,
        publicClient
    }),
);

export default function WagmiProvider({ children }: PropsWithChildren) {
    return <WagmiConfig config={wagmiConfig}>
        {children}</WagmiConfig>
} 