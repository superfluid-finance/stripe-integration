import ensureDefined from './utils/ensureDefined';

type InternalConfig = {
  background: {
    host: string;
    port: number;
    apiKey: string;
  };
};

const internalConfig: InternalConfig = {
  background: {
    host: ensureDefined(process.env.BACKGROUND_HOST, 'BACKGROUND_HOST'),
    port: Number(ensureDefined(process.env.BACKGROUND_PORT, 'BACKGROUND_PORT')),
    apiKey: ensureDefined(process.env.BACKGROUND_API_KEY, 'BACKGROUND_API_KEY'),
  },
};

export default Object.freeze(internalConfig);
