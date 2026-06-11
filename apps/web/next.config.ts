import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
