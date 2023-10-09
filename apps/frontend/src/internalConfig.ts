import { Address } from 'wagmi';
import ensureDefined from './utils/ensureDefined';

// TODO(KK): Split up this file for better readability.

type StripeCurrencyKey = string;
type ChainID = number;

type ChainToSuperTokenMap = Map<ChainID, Address>;
export type StripeCurrentToSuperTokenMap = Map<StripeCurrencyKey, ChainToSuperTokenMap>; // Find a better spot for this.

export type ChainToReceiverAddressMap = Map<ChainID, Address>;

type InternalConfig = {
  stripeSecretKey: string;
  stripeCurrencyToSuperTokenMap: StripeCurrentToSuperTokenMap;
  chainToReceiverAddressMap: ChainToReceiverAddressMap;
  background: {
    host: string;
    port: number;
    apiKey: string;
  }
};

const networkToSuperTokenMap = new Map<ChainID, Address>([[5, '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a']]);

const stripeCurrencyToSuperTokenMap = new Map<StripeCurrencyKey, ChainToSuperTokenMap>([
  ['usd', networkToSuperTokenMap],
]);

const chainToReceiverAddressMap: ChainToReceiverAddressMap = new Map<ChainID, Address>([
  [5, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
]);

const internalConfig: InternalConfig = {
  stripeSecretKey: ensureDefined(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY'),
  stripeCurrencyToSuperTokenMap: stripeCurrencyToSuperTokenMap,
  chainToReceiverAddressMap,
  background: {
    host: ensureDefined(process.env.BACKGROUND_HOST, 'BACKGROUND_HOST'),
    port: Number(ensureDefined(process.env.BACKGROUND_PORT, 'BACKGROUND_PORT')),
    apiKey: ensureDefined(process.env.BACKGROUND_API_KEY, 'BACKGROUND_API_KEY')
  }
};

// TODO(KK): Enabled networks

export default Object.freeze(internalConfig);
