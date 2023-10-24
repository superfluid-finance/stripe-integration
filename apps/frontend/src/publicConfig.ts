import ensureDefined from './utils/ensureDefined';

import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const publicConfig = {
  walletConnectProjectId: publicRuntimeConfig.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID,
} as const;

export default Object.freeze(publicConfig);
