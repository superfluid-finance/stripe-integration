import { Address, ChainId, StripeCurrencyKey } from './basic-types';

type SuperToken = { address: Address; chainId: ChainId };
export type StripeCurrencyToSuperTokenMap = Map<StripeCurrencyKey, SuperToken[]>;
