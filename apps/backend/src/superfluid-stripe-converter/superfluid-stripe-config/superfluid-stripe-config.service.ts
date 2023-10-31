import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import Stripe from 'stripe';
import { Address, ChainId, StripeCurrencyKey } from './basic-types';
import { isAddress } from 'viem';

const CUSTOMER_EMAIL = "stripe@superfluid.finance"; // This is the key for finding the customer.
const LOOK_AND_FEEL_CUSTOMER_NAME = "Superfluid ♥ Stripe: Look and Feel";
const BLOCKCHAIN_CUSTOMER_NAME = "Superfluid ♥ Stripe: Blockchain";

const DEFAULT_LOOK_AND_FEEL_CUSTOMER = {
  email: CUSTOMER_EMAIL,
  name: LOOK_AND_FEEL_CUSTOMER_NAME,
  description: 'Auto-generated fake customer for Superfluid integration.',
  metadata:
    {
      theme: `{"palette":{"mode":"light","primary":{"main":"#3f51b5"},"secondary":{"main":"#f50057"}}}`,
    }
} as const satisfies Stripe.CustomerCreateParams;

const DEFAULT_BLOCKCHAIN_CUSTOMER = {
  email: CUSTOMER_EMAIL,
  name: BLOCKCHAIN_CUSTOMER_NAME,
  description: 'Auto-generated fake customer for Superfluid integration.', // TODO(KK): Add documentation here.
  metadata:
    {
      "chain_43114_usd_token": "0x288398f314d472b82c44855f3f6ff20b633c2a97",
      "chain_43114_receiver": "0x...",
      "chain_42161_usd_token": "0x1dbc1809486460dcd189b8a15990bca3272ee04e",
      "chain_42161_receiver": "0x...",
      "chain_100_usd_token": "0x1234756ccf0660e866305289267211823ae86eec",
      "chain_100_receiver": "0x...",
      "chain_1_usd_token": "0x1ba8603da702602a75a25fca122bb6898b8b1282",
      "chain_1_receiver": "0x...",
      "chain_10_usd_token": "0x8430f084b939208e2eded1584889c9a66b90562f",
      "chain_10_receiver": "0x...",
      "chain_137_usd_token": "0xcaa7349cea390f89641fe306d93591f87595dc1f",
      "chain_137_receiver": "0x...",
      "chain_5_usd_token": "0x8ae68021f6170e5a766be613cea0d75236ecca9a",
      "chain_5_receiver": "0x...",
      "default_receiver": "",
    }
} as const satisfies Stripe.CustomerCreateParams;

export type IntegrationConfig = {
  version: string;
  chains: ReadonlyArray<ChainConfig>;
  theme: any // TODO(KK): any
  // lookAndFeel: Record<string, any>;
}

interface GlobalConfigCustomerManager {
  loadConfig(): Promise<IntegrationConfig>;
}

@Injectable()
export class SuperfluidStripeConfigService implements GlobalConfigCustomerManager {
    constructor(@InjectStripeClient() private readonly stripeClient: Stripe) {}

    async loadConfig(): Promise<IntegrationConfig> {
      // TODO: caching
      // TODO: use better constants
  
      let configurationCustomer: Stripe.Customer;
  
      const customers = await this.stripeClient.customers
        .list({
          email: CUSTOMER_EMAIL,
        })
        .autoPagingToArray(DEFAULT_PAGING);

      let blockchainCustomer = customers.find(x => x.name === BLOCKCHAIN_CUSTOMER_NAME);
      let lookAndFeelCustomer = customers.find(x => x.name === LOOK_AND_FEEL_CUSTOMER_NAME);

      if (!blockchainCustomer) {
        blockchainCustomer = await this.stripeClient.customers.create(DEFAULT_BLOCKCHAIN_CUSTOMER);
      }

      if (!lookAndFeelCustomer) {
        lookAndFeelCustomer = await this.stripeClient.customers.create(DEFAULT_LOOK_AND_FEEL_CUSTOMER);
      }

      const chainConfigs = mapBlockchainCustomerMetadataIntoChainConfigs(blockchainCustomer.metadata);

      // TODO: use Zod for validation?
      // TODO: get rid of any
      let theme: any;
      try {
        theme = JSON.parse(lookAndFeelCustomer.metadata['theme']);
      } catch (e) {
        logger.error(e);
      }

      const mappedResult: IntegrationConfig = {
        version: "1.0.0",
        chains: chainConfigs,
        theme 
      }
  
      return mappedResult;
    }
}

export type ChainConfig = {
  chainId: ChainId,
  receiverAddress: Address,
  currency: StripeCurrencyKey,
  superTokenAddress: Address;
}

const mapBlockchainCustomerMetadataIntoChainConfigs = (metadata: Record<string, string>): ChainConfig[] => {
  const defaultReceiverAddress = metadata.default_receiver;

  const chainConfigs: ChainConfig[] = [];

  const chainIds = [...new Set(Object.keys(metadata).map(key => {
    const match = key.match(/chain_(\d+)/);
    return match ? Number(match[1]) : undefined;
  }).filter((chainId): chainId is number => chainId !== undefined))];

  for (const chainId of chainIds) {
    const receiverAddress = metadata[`chain_${chainId}_receiver`] || defaultReceiverAddress;
    if (!isAddress(receiverAddress)) {
      continue;
    }
    
    // Filter currency-token entries for this chainId
    const chainSpecificKeys = Object.keys(metadata).filter(key => key.startsWith(`chain_${chainId}_`));

    for(const key of chainSpecificKeys) {
      const match = key.match(/chain_\d+_(.+)_token/);
      const currency = match ? match[1] : undefined;
      // TODO(KK): Validate if Stripe currency
      if (currency) {
        const superTokenAddress = metadata[key];
        if (isAddress(superTokenAddress)) {
          chainConfigs.push({ chainId, currency, superTokenAddress, receiverAddress });
        }
      } 
    }
  }

  return chainConfigs;
}

const logger = new Logger(SuperfluidStripeConfigService.name);