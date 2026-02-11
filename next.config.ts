import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1d4k3x3vue16f.cloudfront.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'd24m6tlyyekrd5.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
