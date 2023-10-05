import Stripe from 'stripe';
import { useMemo } from 'react';
import internalConfig from '@/internalConfig';

const useStripeClient = () => {
  const stripeClient = useMemo(
    () =>
      new Stripe(internalConfig.stripeSecretKey, {
        apiVersion: '2023-08-16',
      }),
    [],
  );

  return stripeClient;
};

export default useStripeClient;
