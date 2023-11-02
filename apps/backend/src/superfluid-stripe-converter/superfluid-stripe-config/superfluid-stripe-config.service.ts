import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_PAGING } from 'src/stripe-module-config';
import Stripe from 'stripe';
import { Address, ChainId, StripeCurrencyKey } from './basic-types';
import { Block, isAddress } from 'viem';
import {
  BLOCKCHAIN_CUSTOMER_NAME,
  CUSTOMER_EMAIL,
  DEFAULT_LOOK_AND_FEEL_CUSTOMER,
  FIRST_TIME_EXAMPLE_PRODUCT,
  LOOK_AND_FEEL_CUSTOMER_NAME,
  createDefaultBlockChainCustomer,
} from './stripe-entities';
import { ConfigService } from '@nestjs/config';

export type LookAndFeelConfig = {
  theme: any; // TODO(KK): any
};

export type BlockchainConfig = {
  version: string;
  chains: ReadonlyArray<ChainConfig>;
};

export type CompleteConfig = LookAndFeelConfig & BlockchainConfig;

interface GlobalConfigCustomerManager {
  loadOrInitializeCompleteConfig(): Promise<CompleteConfig>;
  loadOrInitializeLookAndFeelConfig(): Promise<LookAndFeelConfig>;
  loadOrInitializeBlockchainConfig(): Promise<BlockchainConfig>;
}

@Injectable()
export class SuperfluidStripeConfigService implements GlobalConfigCustomerManager {
  private readonly stripeTestMode;

  constructor(
    @InjectStripeClient() private readonly stripeClient: Stripe,
    private readonly configService: ConfigService,
  ) {
    this.stripeTestMode = this.configService.get('STRIPE_TEST_MODE') === 'true';
  }

  async loadOrInitializeLookAndFeelConfig(): Promise<LookAndFeelConfig> {
    const { lookAndFeelCustomer: lookAndFeelCustomer_ } = await this.loadCustomers();
    const lookAndFeelCustomer =
      lookAndFeelCustomer_ ??
      (await this.stripeClient.customers.create(DEFAULT_LOOK_AND_FEEL_CUSTOMER));

    // TODO: use Zod for validation?
    // TODO: get rid of any
    const theme = JSON.parse(lookAndFeelCustomer.metadata.theme);

    return {
      theme,
    };
  }

  async loadOrInitializeBlockchainConfig(): Promise<BlockchainConfig> {
    const { blockchainCustomer: blockchainCustomer_ } = await this.loadCustomers();
    const blockchainCustomer =
      blockchainCustomer_ ??
      (await this.stripeClient.customers.create(
        createDefaultBlockChainCustomer(this.stripeTestMode),
      ));

    const chainConfigs = mapBlockchainCustomerMetadataIntoChainConfigs(blockchainCustomer.metadata);

    return {
      version: '1.0.0',
      chains: chainConfigs,
    };
  }

  async loadOrInitializeCompleteConfig(): Promise<CompleteConfig> {
    const { lookAndFeelCustomer, blockchainCustomer } = await this.loadCustomers();

    const isFirstTimeUsage = !lookAndFeelCustomer && !blockchainCustomer;
    if (this.stripeTestMode) {
      if (isFirstTimeUsage) {
        await this.stripeClient.products.create(FIRST_TIME_EXAMPLE_PRODUCT);
      }
    }

    const lookAndFeelConfig = await this.loadOrInitializeLookAndFeelConfig();
    const blockchainConfig = await this.loadOrInitializeBlockchainConfig();

    return {
      ...lookAndFeelConfig,
      ...blockchainConfig,
    };
  }

  private async loadCustomers(): Promise<{
    blockchainCustomer: Stripe.Customer | undefined;
    lookAndFeelCustomer: Stripe.Customer | undefined;
  }> {
    // TODO: cache

    const customers = await this.stripeClient.customers
      .list({
        email: CUSTOMER_EMAIL,
      })
      .autoPagingToArray(DEFAULT_PAGING);

    return {
      blockchainCustomer: customers.find((x) => x.name === BLOCKCHAIN_CUSTOMER_NAME),
      lookAndFeelCustomer: customers.find((x) => x.name === LOOK_AND_FEEL_CUSTOMER_NAME),
    };
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
