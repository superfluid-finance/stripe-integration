import { tierASuperTokenList } from "@superfluid-finance/tokenlist"

import Stripe from "stripe";

export const CUSTOMER_EMAIL = 'stripe@superfluid.finance'; // This is always the key for finding the customers.

// The customer names are used for finding the configuration with right type.
export const LOOK_AND_FEEL_CUSTOMER_NAME = 'Superfluid ♥ Stripe: Look and Feel';
export const BLOCKCHAIN_CUSTOMER_NAME = 'Superfluid ♥ Stripe: Blockchain';

// This is the default customer for look and feel to bootstrap the integration.
export const DEFAULT_LOOK_AND_FEEL_CUSTOMER = {
  email: CUSTOMER_EMAIL,
  name: LOOK_AND_FEEL_CUSTOMER_NAME,
  description: 'Auto-generated fake customer for Superfluid integration.',
  metadata: {
    theme: `{"palette":{"mode":"light","primary":{"main":"#3f51b5"},"secondary":{"main":"#f50057"}}}`,
  },
} as const satisfies Stripe.CustomerCreateParams;

const liveCurrencyTokenSymbols = {
  usd: ["USDCx", "USDTx", "DAIx", "cUSDx", "G$", "mUSDx"],
  eur: ["cEURx", "EUROex", "EURSx", "agEURx", "jEURx", "EURex"],
  cad: ["jCADx"],
  bgn: ["jBGNx"],
  chf: ["jXOFx"],
  php: ["jPHPx"],
  xaf: ["jXAFx"],
  sgd: ["jSGDx"],
  jpy: ["JPYCx"],
}

// This is the default customer for on-chain settings.
export const createDefaultBlockChainCustomer = (testMode: boolean): Stripe.CustomerCreateParams => {

  return ({
    email: CUSTOMER_EMAIL,
    name: BLOCKCHAIN_CUSTOMER_NAME,
    description: 'Auto-generated fake customer for Superfluid integration.',
    metadata: {
      chain_5_usd_token: '0x8ae68021f6170e5a766be613cea0d75236ecca9a',
      chain_5_receiver: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      default_receiver: ''
    },
  });
};

// This is the default customer for on-chain settings.
export const DEFAULT_LIVE_BLOCKCHAIN_CUSTOMER = {
  email: CUSTOMER_EMAIL,
  name: BLOCKCHAIN_CUSTOMER_NAME,
  description: 'Auto-generated fake customer for Superfluid integration.', // TODO(KK): Add documentation here.
  metadata: {
    chain_43114_usd_token: '0x288398f314d472b82c44855f3f6ff20b633c2a97',
    chain_43114_receiver: '0x...',
    chain_42161_usd_token: '0x1dbc1809486460dcd189b8a15990bca3272ee04e',
    chain_42161_receiver: '0x...',
    chain_100_usd_token: '0x1234756ccf0660e866305289267211823ae86eec',
    chain_100_receiver: '0x...',
    chain_1_usd_token: '0x1ba8603da702602a75a25fca122bb6898b8b1282',
    chain_1_receiver: '0x...',
    chain_10_usd_token: '0x8430f084b939208e2eded1584889c9a66b90562f',
    chain_10_receiver: '0x...',
    chain_137_usd_token: '0xcaa7349cea390f89641fe306d93591f87595dc1f',
    chain_137_receiver: '0x...',
    default_receiver: '',
  },
} as const satisfies Stripe.CustomerCreateParams;

export const FIRST_TIME_EXAMPLE_PRODUCT: Stripe.ProductCreateParams = {
  name: 'Example Superfluid Integration Product',
  features: [
    { name: 'decentralized' },
    { name: 'pseudoanonymous' },
    { name: 'pay and get paid every second' },
    { name: 'complete control of your money streams' },
  ],
  default_price_data: {
    currency: 'USD',
    recurring: {
      interval: 'month',
    },
    unit_amount: 500,
  },
  // metadata: {
  //   superfluid: `The value here does not matter. When "superfluid" metadata key is specified then it is valid for the Superfluid integration.`
  // }
};