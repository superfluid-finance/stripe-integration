import ensureDefined from './utils/ensureDefined';

type InternalConfig = {
  getApiKey: () => string;
  getBackendBaseUrl: () => URL;
};

const internalConfig: InternalConfig = {
  getApiKey() {
    const apiKey = ensureDefined(process.env.INTERNAL_API_KEY, 'INTERNAL_API_KEY');
    return apiKey;
  },
  getBackendBaseUrl() {
    const host = ensureDefined(process.env.BACKEND_HOST, 'BACKEND_HOST');
    const port = Number(ensureDefined(process.env.BACKEND_PORT, 'BACKEND_PORT'));
    return new URL(`http://${host}:${port}`);
  },
};

export default Object.freeze(internalConfig);
