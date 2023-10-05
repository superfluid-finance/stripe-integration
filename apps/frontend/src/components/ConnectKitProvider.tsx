
import { ConnectKitProvider as ConnectKitProvider_, ConnectKitButton, getDefaultConfig } from "connectkit";
import { PropsWithChildren, useState, createContext, useMemo } from "react"

type InitialChainId = number | undefined;
type ConnectKitContextValue = {
    initialChainId: InitialChainId,
    setInitialChainId: (chainId: InitialChainId) => void;
}

const ConnectKitContext = createContext<ConnectKitContextValue>(undefined!);

export default function ConnectKitProvider({ children }: PropsWithChildren) {
    const [initialChainId, setInitialChainId] = useState<number | undefined>();

    return (<ConnectKitContext.Provider value={useMemo(() => ({
        initialChainId,
        setInitialChainId
    }), [initialChainId, setInitialChainId])}>
        <ConnectKitProvider_ options={{
            initialChainId
        }}>
            {children}
        </ConnectKitProvider_>
    </ConnectKitContext.Provider>)
}