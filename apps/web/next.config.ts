import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output for Docker deployments
  output: 'standalone',

  // React strict mode for catching bugs early
  reactStrictMode: true,

  // Allow images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  experimental: {},
};

export default nextConfig;
