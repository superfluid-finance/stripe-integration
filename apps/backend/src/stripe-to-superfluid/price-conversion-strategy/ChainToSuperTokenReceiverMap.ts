import { Address, ChainId } from './basic-types';

export type ChainToSuperTokenReceiverMap = Map<ChainId, Address>;

export const defaultChainToSuperTokenReceiverMap: ChainToSuperTokenReceiverMap = new Map<
  ChainId,
  Address
>([[5, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']]);
