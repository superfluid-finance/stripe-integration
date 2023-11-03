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
  theme: WidgetProps['theme'];
};

export default function SupefluidWidgetProvider({
  productId,
  paymentDetails,
  productDetails,
  personalData,
  theme,
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

  const eventListeners = useMemo<EventListeners>(
    () => ({
      onPaymentOptionUpdate: (paymentOption) => setPaymentOption(paymentOption),
      onRouteChange: (arg) => {
        const email = arg?.data?.['email'];
        if (email && accountAddress && paymentOption && arg?.route === 'transactions') {
          const data: CreateSessionData = {
            productId,
            chainId: paymentOption.chainId,
            superTokenAddress: paymentOption.superToken.address,
            senderAddress: accountAddress,
            receiverAddress: paymentOption.receiverAddress,
            email: email,
            idempotencyKey: idempotencyKey,
          };
          createSession(data);
        }
      },
    }),
    [productId, paymentOption, accountAddress, createSession],
  );

  return (
    <SuperfluidWidget
      type="page"
      walletManager={walletManager}
      eventListeners={eventListeners}
      paymentDetails={paymentDetails}
      productDetails={productDetails}
      personalData={personalData}
      theme={theme}
    />
  );
}

const idempotencyKey = Math.random().toString(20).substr(2, 8); // Random key, generated once per front-end initialization.
