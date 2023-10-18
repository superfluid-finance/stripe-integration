import ensureDefined from './utils/ensureDefined';

const publicConfig = {
  walletConnectProjectId: ensureDefined(
    process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID,
    'NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID', // TODO(KK): When dockerizing then this needs to be changed away from being "NEXT_PUBLIC_" variable
  ),
} as const;

export default Object.freeze(publicConfig);
