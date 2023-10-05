const publicConfig = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID ?? '952483bf7a0f5ace4c40eb53967f1368',
} as const;

export default Object.freeze(publicConfig);
