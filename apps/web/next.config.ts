import type { NextConfig } from 'next';

// 媒体热链的上游域名（inspora 原站 CDN + 布局参考上游仓库的 jsDelivr）
const UPSTREAM_HOSTS = ['media.inspora.design', 'cdn.jsdelivr.net'];

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
  images: {
    remotePatterns: [...UPSTREAM_HOSTS, ...(mediaHost ? [mediaHost] : [])].map(
      (hostname) => ({ protocol: 'https' as const, hostname }),
    ),
    // 本地开发走 fake-ip 代理时上游域名会解析到 198.18.x.x（私有段），
    // Next 的 SSRF 防护会拒绝优化器拉取；remotePatterns 已限制域名白名单，风险可控
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
