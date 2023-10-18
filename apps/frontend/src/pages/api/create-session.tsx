import internalConfig from '@/internalConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

export type CreateSessionData = {
  productId: string;
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  email: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const createSessionRequest: CreateSessionData = req.body as CreateSessionData;

        const createSessionRequest: CreateSessionData = req.body as CreateSessionData

        const url = new URL("/checkout-session/create", internalConfig.getBackendBaseUrl());
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "x-api-key": internalConfig.getApiKey(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createSessionRequest)
        });

    const status = response.status;
    const data = await response.text();

    return res.status(status).send(data);
  } else {
    return res.status(404);
  }
}
