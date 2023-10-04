import internalConfig from "@/internalConfig";
import convertStripeProductToSuperfluidWidget from "@/services/convertStripeProductToSuperfluidWidget";
import SuperfluidWidget, { EventListeners, WalletManager, supportedNetworks } from "@superfluid-finance/widget";
import { useModal } from "connectkit";
import { useMemo, useState } from "react";
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

    const eventListeners = useMemo<EventListeners>(() => ({
        // onPaymentOptionUpdate: (paymentOption) => setInitialChainId(paymentOption?.chainId)
        onTransactionSent: () => {
            // Ensure customer

            // Create subscription
        }
    }), []);

    // TODO(KK): When to ensure customer
    // TODO(KK): When to create subscription

    const config = useMemo(() => convertStripeProductToSuperfluidWidget({
        product: stripeProduct,
        prices: stripePrices,
        chainToReceiverAddressMap: internalConfig.chainToReceiverAddressMap,
        currencyToSuperTokenMap: internalConfig.stripeCurrencyToSuperTokenMap
    }), [stripeProduct]);

    const [email, setEmail] = useState<string | undefined>();

    return (<>
        <SuperfluidWidget
            type="page"
            walletManager={walletManager}
            // eventListeners={eventListeners} 
            paymentDetails={config.paymentDetails}
            productDetails={config.productDetails}
        />
        <div className="bg-neutral-500 text-black">
            <p>e-mail:</p>
            <input type="email" onChange={(e) => setEmail(e.target.value)} ></input>
        </div>
    </>
    )
}