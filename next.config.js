/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['ghost.wheelstrategyoptions.com'],
    unoptimized: false,
  },
};

module.exports = nextConfig;
