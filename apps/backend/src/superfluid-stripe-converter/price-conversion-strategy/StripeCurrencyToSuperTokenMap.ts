import { Address, ChainId, StripeCurrencyKey } from './basic-types';

type SuperToken = { address: Address; chainId: ChainId };
export type StripeCurrencyToSuperTokenMap = Map<StripeCurrencyKey, SuperToken[]>;

const usdTokens: SuperToken[] = [
  {
    address: '0x288398f314d472b82c44855f3f6ff20b633c2a97',
    chainId: 43114,
  },
  {
    address: '0x1dbc1809486460dcd189b8a15990bca3272ee04e',
    chainId: 42161,
  },
  {
    address: '0x1234756ccf0660e866305289267211823ae86eec',
    chainId: 100,
  },
  {
    address: '0x1ba8603da702602a75a25fca122bb6898b8b1282',
    chainId: 1,
  },
  {
    address: '0x8430f084b939208e2eded1584889c9a66b90562f',
    chainId: 10,
  },
  {
    address: '0xcaa7349cea390f89641fe306d93591f87595dc1f',
    chainId: 137,
  },
  {
    address: '0x8ae68021f6170e5a766be613cea0d75236ecca9a',
    chainId: 5,
  },
];

export const defaultStripeCurrencyToSuperTokenMap = new Map<StripeCurrencyKey, SuperToken[]>([
  ['usd', usdTokens],
]);
