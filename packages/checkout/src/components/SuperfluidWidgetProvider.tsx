import internalConfig from "@/internalConfig";
import convertStripeProductToSuperfluidWidget from "@/services/convertStripeProductToSuperfluidWidget";
import SuperfluidWidget, { EventListeners, WalletManager, supportedNetworks } from "@superfluid-finance/widget";
import { useModal } from "connectkit";
import { useMemo } from "react";
import Stripe from "stripe";

type Props = {
    // setInitialChainId: (chainId: number | undefined) => void;
    stripeProduct: Stripe.Product
    stripePrices: Stripe.Price[]
}

export default function SupefluidWidgetProvider({ stripeProduct, stripePrices }: Props) {
    const { open, setOpen } = useModal();

    const walletManager = useMemo<WalletManager>(() => ({
        isOpen: open,
        open: () => setOpen(true)
    }), [open, setOpen]);

    // const eventListeners = useMemo<EventListeners>(() => ({
    //     onPaymentOptionUpdate: (paymentOption) => setInitialChainId(paymentOption?.chainId)
    // }), [setInitialChainId]);

    const config = useMemo(() => convertStripeProductToSuperfluidWidget({
        product: stripeProduct,
        prices: stripePrices,
        chainToReceiverAddressMap: internalConfig.chainToReceiverAddressMap,
        currencyToSuperTokenMap: internalConfig.stripeCurrencyToSuperTokenMap
    }), [stripeProduct]);

    return (<SuperfluidWidget type="page" walletManager={walletManager}
        // eventListeners={eventListeners} 
        paymentDetails={config.paymentDetails}
        productDetails={config.productDetails}
    />)
}