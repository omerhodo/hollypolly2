import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
  },
  // Vercel deployment optimizations
  experimental: {
    // Optimize server-side rendering
    serverMinification: true,
  },
  // Optimize output
  output: 'standalone',
  // Reduce bundle size
  swcMinify: true,
  // Prevent Vercel timeout issues
  staticPageGenerationTimeout: 120,
};

export default withNextIntl(nextConfig);
