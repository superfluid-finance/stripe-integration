import { CreateSessionData } from '@/pages/api/create-session';
import SuperfluidWidget, {
  PaymentOption,
  WalletManager,
  WidgetProps,
  Callbacks,
  PersonalData
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

  const { mutateAsync: createSession } = useMutation(
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



  const callbacks = useMemo<Callbacks>(
    () => ({
      onPaymentOptionUpdate: (paymentOption) => setPaymentOption(paymentOption),
      onRouteChange: (arg) => {
        const email = arg?.data?.['e-mail']; // TODO(KK): use better name than "e-mail", prefer "email"

        if (arg?.route === 'transactions') {
          if (email && accountAddress && paymentOption) {
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
          } else {
            throw new Error(`Something went wrong when creating a session. Data: [${{ email, accountAddress, paymentOption }}]`); // TODO(KK): remove this data from the error?
          }
        }
      },
      validatePersonalData: (data: PersonalData) => {

        // const email = data.find(x => x.name === "email")!;

        // TODO(KK): Validate against Stripe so not already subscribed.

        // return ({
        //   "email": {
        //     message: "test-test-test",
        //     success: true
        //   }
        // });
      }
    }),
    [productId, paymentOption, accountAddress, createSession],
  );

  return (
    <SuperfluidWidget
      type="page"
      walletManager={walletManager}
      paymentDetails={paymentDetails}
      productDetails={productDetails}
      personalData={personalData}
      theme={theme}
      callbacks={callbacks}
    />
  );
}

const idempotencyKey = Math.random().toString(20).substr(2, 8); // Random key, generated once per front-end initialization.
