import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@personal-design/layout-compositions'],
  allowedDevOrigins: ['personal-design.localhost', '*.personal-design.localhost'],
};

export default nextConfig;
