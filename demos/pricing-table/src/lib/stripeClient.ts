import ensureDefined from '@/utils/ensureDefined';
import Stripe from 'stripe';

const stripeClient = new Stripe(ensureDefined(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

export default stripeClient;
