import {
  ConnectKitProvider as ConnectKitProvider_,
  ConnectKitButton,
  getDefaultConfig,
} from 'connectkit';
import { PropsWithChildren, useState, createContext, useMemo } from 'react';

type InitialChainId = number | undefined;
type Mode = 'dark' | 'light';
type ConnectKitContextValue = {
  initialChainId: InitialChainId;
  setInitialChainId: (chainId: InitialChainId) => void;
};

const ConnectKitContext = createContext<ConnectKitContextValue>(undefined!);

type Props = PropsWithChildren<{ mode?: Mode }>;

export default function ConnectKitProvider({ children, mode }: Props) {
  const [initialChainId, setInitialChainId] = useState<number | undefined>();

  return (
    <ConnectKitContext.Provider
      value={useMemo(
        () => ({
          initialChainId,
          setInitialChainId,
        }),
        [initialChainId, setInitialChainId],
      )}
    >
      <ConnectKitProvider_
        mode={mode}
        options={{
          initialChainId,
        }}
      >
        {children}
      </ConnectKitProvider_>
    </ConnectKitContext.Provider>
  );
}
