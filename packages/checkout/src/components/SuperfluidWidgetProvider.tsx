import SuperfluidWidget, { EventListeners, WalletManager, supportedNetworks } from "@superfluid-finance/widget";
import { useModal } from "connectkit";
import { useMemo } from "react";
import Stripe from "stripe";

type Props = {
    setInitialChainId: (chainId: number | undefined) => void;
    stripeProduct: Stripe.Product
}

export default function SupefluidWidgetProvider({ setInitialChainId }: Props) {
    const { open, setOpen } = useModal();

    const walletManager = useMemo<WalletManager>(() => ({
        isOpen: open,
        open: () => setOpen(true)
    }), [open, setOpen]);

    const eventListeners = useMemo<EventListeners>(() => ({
        onPaymentOptionUpdate: (paymentOption) => setInitialChainId(paymentOption?.chainId)
    }), [setInitialChainId]);

    return (<SuperfluidWidget type="page" walletManager={walletManager} eventListeners={eventListeners} paymentDetails={{
        paymentOptions: {
            chainId: 1,
            receiverAddress: "0x7269B0c7C831598465a9EB17F6c5a03331353dAF",
            superToken: { address: "0xC22BeA0Be9872d8B7B3933CEc70Ece4D53A900da" }
        }
    }}
    />)
}