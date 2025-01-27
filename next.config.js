/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['ghost.wheelstrategyoptions.com'],
    unoptimized: false,
  },
  // Add this to handle dynamic routes in static export
  trailingSlash: true,
  // Add these for Docker deployment
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

module.exports = nextConfig;
