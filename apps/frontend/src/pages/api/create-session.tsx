import { paths } from '@/backend-openapi-client';
import internalConfig from '@/internalConfig';
import type { NextApiRequest, NextApiResponse } from 'next';
import createClient from 'openapi-fetch';

// import { } "@/backend-openapi-client"

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

    const client = createClient<paths>({
      baseUrl: internalConfig.getBackendBaseUrl().toString(),
    });

    const { response } = await client.POST('/checkout-session/create', {
      params: {
        header: {
          'x-api-key': internalConfig.getApiKey(),
        },
      },
      body: createSessionRequest,
    });

    const status = response.status;
    const data = await response.text();

    return res.status(status).send(data);
  } else {
    return res.status(404);
  }
}
