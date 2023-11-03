import ensureDefined from './utils/ensureDefined';

type InternalConfig = {
  getApiKey: () => string;
  getBackendBaseUrl: () => URL;
};

const internalConfig: InternalConfig = {
  getApiKey() {
    const apiKey = ensureDefined(
      process.env.STRIPE_SECRET_KEY ?? process.env.INTERNAL_API_KEY,
      'STRIPE_SECRET_KEY or INTERNAL_API_KEY',
    );
    return apiKey;
  },
  getBackendBaseUrl() {
    const host = ensureDefined(process.env.BACKEND_HOST, 'BACKEND_HOST');
    const protocol = process.env.BACKEND_PROTOCOL ?? 'https';
    const port = Number(process.env.BACKEND_PORT);
    if (port) {
      return new URL(`${protocol}://${host}:${port}`);
    } else {
      return new URL(`${protocol}://${host}`);
    }
  },
};

export default Object.freeze(internalConfig);
