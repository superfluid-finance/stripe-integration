'use client';

import { CreateSessionData } from '@/pages/api/create-session';
import SuperfluidWidget, {
  EventListeners,
  PaymentOption,
  WalletManager,
  WidgetProps,
} from '@superfluid-finance/widget';
import { useModal } from 'connectkit';
import { useMemo, useState } from 'react';
import { useAccount, useMutation } from 'wagmi';

type Props = {
  productId: string;
  // setInitialChainId: (chainId: number | undefined) => void;
  productDetails: WidgetProps['productDetails'];
  paymentDetails: WidgetProps['paymentDetails'];
  personalData: WidgetProps['personalData'];
};

export default function SupefluidWidgetProvider({
  productId,
  paymentDetails,
  productDetails,
  personalData,
}: Props) {
  const { open, setOpen } = useModal();

  const walletManager = useMemo<WalletManager>(
    () => ({
      isOpen: open,
      open: () => setOpen(true),
    }),
    [open, setOpen],
  );

  const { mutate: createSession } = useMutation(
    ['createSession'],
    async (data: CreateSessionData) => {
      await fetch('/api/create-session', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        method: 'POST',
      });
    },
  );

  const [paymentOption, setPaymentOption] = useState<PaymentOption | undefined>();
  const { address: accountAddress } = useAccount();

  const [email, setEmail] = useState<string | undefined>();

  const eventListeners = useMemo<EventListeners>(
    () => ({
      onPaymentOptionUpdate: (paymentOption) => setPaymentOption(paymentOption),
      onRouteChange: (arg) => {
        console.log('onRouteChange');
        if (accountAddress && paymentOption && arg?.route === 'transactions') {
          console.log('creating session');
          const data: CreateSessionData = {
            productId,
            chainId: paymentOption.chainId,
            superTokenAddress: paymentOption.superToken.address,
            senderAddress: accountAddress,
            receiverAddress: paymentOption.receiverAddress,
            email: email ?? '',
          };
          createSession(data);
        }
      },
    }),
    [productId, email, paymentOption, accountAddress, createSession],
  );

  return (
    <>
      <SuperfluidWidget
        type="page"
        walletManager={walletManager}
        eventListeners={eventListeners}
        paymentDetails={paymentDetails}
        productDetails={productDetails}
        personalData={personalData}
      />
      <div className="bg-neutral-500 text-black">
        <p>e-mail:</p>
        <input type="email" onChange={(e) => setEmail(e.target.value)}></input>
      </div>
    </>
  );
}
