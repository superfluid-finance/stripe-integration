/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  publicRuntimeConfig: {
    NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLECT_CONNECT_PROJECT_ID,
  },
};
