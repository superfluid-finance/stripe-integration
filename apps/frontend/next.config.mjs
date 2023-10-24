/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  reactStrictMode: true,
  publicRuntimeConfig: {
    NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID,
  },
  transpilePackages: [
    "@superfluid-finance/tokenlist"
  ]
};

export default config;