import ensureDefined from "./utils/ensureDefined";

const publicConfig = {
  walletConnectProjectId: ensureDefined(process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID, "NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID"),
} as const;

export default Object.freeze(publicConfig);
