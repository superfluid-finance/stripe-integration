import ensureDefined from './utils/ensureDefined';

type InternalConfig = {
  getApiKey: () => string;
  getBackendBaseUrl: () => URL;
};

const internalConfig: InternalConfig = {
  getApiKey() {
    const apiKey = ensureDefined(process.env.BACKGROUND_API_KEY, 'BACKGROUND_API_KEY');
    return apiKey
  },
  getBackendBaseUrl() {
    const host = ensureDefined(process.env.BACKGROUND_HOST, 'BACKGROUND_HOST');
    const port = Number(ensureDefined(process.env.BACKGROUND_PORT, 'BACKGROUND_PORT'));
    return new URL(`http://${host}:${port}`);
  } 
};

export default Object.freeze(internalConfig);
