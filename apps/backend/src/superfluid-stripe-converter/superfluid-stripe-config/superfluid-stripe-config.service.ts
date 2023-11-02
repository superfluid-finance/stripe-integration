import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import Stripe from 'stripe';
import { Address, ChainId, StripeCurrencyKey } from './basic-types';
import { isAddress } from 'viem';
import { BLOCKCHAIN_CUSTOMER_NAME, CUSTOMER_EMAIL, DEFAULT_LOOK_AND_FEEL_CUSTOMER, FIRST_TIME_EXAMPLE_PRODUCT, LOOK_AND_FEEL_CUSTOMER_NAME, createDefaultBlockChainCustomer } from './stripe-entities';
import { ConfigService } from '@nestjs/config';

export type IntegrationConfig = {
  version: string;
  chains: ReadonlyArray<ChainConfig>;
  theme: any; // TODO(KK): any
  // lookAndFeel: Record<string, any>;
};

interface GlobalConfigCustomerManager {
  loadOrInitializeConfig(): Promise<IntegrationConfig>;
}

@Injectable()
export class SuperfluidStripeConfigService implements GlobalConfigCustomerManager {
  constructor(@InjectStripeClient() private readonly stripeClient: Stripe, private readonly configService: ConfigService) {}

  async loadOrInitializeConfig(): Promise<IntegrationConfig> {
    const stripeTestMode = this.configService.get("STRIPE_TEST_MODE") === "true";

    // TODO: caching
    // TODO: use better constants

    const customers = await this.stripeClient.customers
      .list({
        email: CUSTOMER_EMAIL,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    let blockchainCustomer = customers.find((x) => x.name === BLOCKCHAIN_CUSTOMER_NAME);
    let lookAndFeelCustomer = customers.find((x) => x.name === LOOK_AND_FEEL_CUSTOMER_NAME);

    if (stripeTestMode) {
      const isFirstTimeUsage = !blockchainCustomer && !lookAndFeelCustomer;
      if (isFirstTimeUsage) {
        await this.stripeClient.products.create(FIRST_TIME_EXAMPLE_PRODUCT);
      }
    }

    if (!blockchainCustomer) {
      blockchainCustomer = await this.stripeClient.customers.create(createDefaultBlockChainCustomer(stripeTestMode));
    }

    if (!lookAndFeelCustomer) {
      lookAndFeelCustomer = await this.stripeClient.customers.create(
        DEFAULT_LOOK_AND_FEEL_CUSTOMER,
      );
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
      version: '1.0.0',
      chains: chainConfigs,
      theme,
    };

    return mappedResult;
  }
}

export type ChainConfig = {
  chainId: ChainId;
  receiverAddress: Address;
  currency: StripeCurrencyKey;
  superTokenAddress: Address;
};

const mapBlockchainCustomerMetadataIntoChainConfigs = (
  metadata: Record<string, string>,
): ChainConfig[] => {
  const defaultReceiverAddress = metadata.default_receiver;

  const chainConfigs: ChainConfig[] = [];

  const chainIds = [
    ...new Set(
      Object.keys(metadata)
        .map((key) => {
          const match = key.match(/chain_(\d+)/);
          return match ? Number(match[1]) : undefined;
        })
        .filter((chainId): chainId is number => chainId !== undefined),
    ),
  ];

  for (const chainId of chainIds) {
    const receiverAddress = metadata[`chain_${chainId}_receiver`] || defaultReceiverAddress;
    if (!isAddress(receiverAddress)) {
      continue;
    }

    // Filter currency-token entries for this chainId
    const chainSpecificKeys = Object.keys(metadata).filter((key) =>
      key.startsWith(`chain_${chainId}_`),
    );

    for (const key of chainSpecificKeys) {
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
};

const logger = new Logger(SuperfluidStripeConfigService.name);
