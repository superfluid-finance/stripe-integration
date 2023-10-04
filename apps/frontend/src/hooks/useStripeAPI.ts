import Stripe from "stripe";
import { useMemo } from "react"
import internalConfig from "@/internalConfig";

const useStripeAPI = () => {
    const stripeAPI = useMemo(() => new Stripe(internalConfig.stripeSecretKey, {
        apiVersion: "2023-08-16"
    }), []);

    return stripeAPI;
}

export default useStripeAPI;