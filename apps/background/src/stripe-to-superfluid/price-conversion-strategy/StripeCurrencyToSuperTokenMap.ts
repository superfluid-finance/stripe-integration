import { Address, ChainId, StripeCurrencyKey } from './basic-types';

type ChainToSuperTokenMap = Map<ChainId, Address>;
export type StripeCurrencyToSuperTokenMap = Map<StripeCurrencyKey, ChainToSuperTokenMap>;

const defaultChainToSuperTokenMap = new Map<ChainId, Address>([
  [5, '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a'],
]);

export const defaultStripeCurrencyToSuperTokenMap = new Map<
  StripeCurrencyKey,
  ChainToSuperTokenMap
>([['usd', defaultChainToSuperTokenMap]]);
