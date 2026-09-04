import type { NextConfig } from 'next';

// 媒体迁到对象存储后（NEXT_PUBLIC_MEDIA_BASE_URL），允许 next/image 从该域名拉取
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
const mediaHost = mediaBase ? new URL(mediaBase).hostname : null;

const nextConfig: NextConfig = {
  transpilePackages: [
    '@personal-design/layout-compositions',
    '@personal-design/inspora',
  ],
  allowedDevOrigins: ['personal-design.localhost', '*.personal-design.localhost'],
  // dev 指示器默认在右上，恰好压住主题切换钮；挪到左下（仅 dev 有效）
  devIndicators: { position: 'bottom-left' },
  images: mediaHost
    ? { remotePatterns: [{ protocol: 'https', hostname: mediaHost }] }
    : undefined,
};

export default nextConfig;
