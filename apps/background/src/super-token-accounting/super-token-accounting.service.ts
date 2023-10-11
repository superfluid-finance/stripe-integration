import { Injectable, Logger } from '@nestjs/common';
import createClient from 'openapi-fetch';
import { components, paths } from './client/types';
import { getUnixTime } from 'date-fns';

type ChainId = components['schemas']['Network'];
type Currency = components['schemas']['Currency'];

@Injectable()
export class SuperTokenAccountingService {
  private readonly accountingClient = createClient<paths>({ baseUrl: 'https://accounting.superfluid.dev/v1/' }); // TODO: Use injection? Use environment variable?

  async getAccountToAccountBalance({
    chainId,
    senderAddress,
    receiverAddress,
    currency,
  }: {
    chainId: ChainId;
    senderAddress: string;
    receiverAddress: string;
    currency: Currency;
  }): Promise<bigint> {
    const end = getUnixTime(new Date());

    // How do we find the start time?
    const start = getUnixTime(new Date());

    // TODO:
    // - Consider caching somewhere.
    // - The approach with Accounting API seems wasteful resource wise.

    const response = await this.accountingClient.GET('/v1/stream-periods', {
      params: {
        query: {
          addresses: [senderAddress],
          chains: [chainId],
          counterparties: [receiverAddress],

          currency: currency, // Pretty meh that this is required.
          priceGranularity: 'year', // I guess this is the average price for the token over the period?

          start: 0, // Get all history
          end,
          virtualization: 'day', // Will this miss anything from the last day?
        },
      },
    });

    const error = response.error;
    if (error) {
      throw error;
    } else {
      const sumTransferred = response.data.reduce(
        (acc, { totalAmountStreamed }) => acc + (totalAmountStreamed ? BigInt(totalAmountStreamed) : 0n),
        0n,
      );
      return sumTransferred;
    }
  }
}

const logger = new Logger(SuperTokenAccountingService.name);
