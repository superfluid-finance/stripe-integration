import internalConfig from '@/internalConfig';
import type { NextApiRequest, NextApiResponse } from 'next'

export type CreateSessionData = {
    chainId: number;
    tokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    email: string;
};

type CreateSessionRequest = {
    apiKey: string;
    data: CreateSessionData;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const backendUrl = new URL(`http://${internalConfig.background.host}:${internalConfig.background.port}/checkout-session/create`);;

        const createSessionRequest: CreateSessionRequest = {
            apiKey: "whatever",
            data: req.body as CreateSessionData
        }

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createSessionRequest)
        });

        const status = response.status;
        const data = await response.text();

        return res.status(status).send(data);
    } else {
        return res.status(404)
    }
}