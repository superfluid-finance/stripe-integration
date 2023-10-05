import WagmiProvider from '@/components/WagmiProvider'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <WagmiProvider><Component {...pageProps} /></WagmiProvider>
}
