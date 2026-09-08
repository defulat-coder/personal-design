/** 独立部署的个人网站；仅保存作品入口与公开预览。 */
export const personalSite = {
  slug: 'personal-sites',
  name: '个人网站',
  tagline: '工程记录、每日关注与开源收藏',
  description: '陈远的个人工程档案，记录工程经历、每日动态、内容收藏与开源关注。',
  date: '2026-09-09',
  dateLabel: '收录',
  href: '/products/personal-sites',
  cover: '/personal-sites/home.webp',
  stats: [],
  line: 'sites' as const,
};

export const websiteUrl = 'https://default-coder.lovemyrmb.cn/';
export const promoUrl = '/personal-sites/promo.mp4';
export const promoPosterUrl = '/personal-sites/promo-poster.webp';
export const siteScreenshots = [
  { src: '/personal-sites/news.webp', title: '每日动态', description: '按日期阅读 AI 与工程领域动态，保留摘要与原始来源。' },
  { src: '/personal-sites/curation.webp', title: '每日关注', description: '把值得留下的内容整理为中文摘要与个人判断，方便持续阅读和回看。' },
  { src: '/personal-sites/open-source.webp', title: '开源关注', description: '按主题浏览收藏的开源项目，继续查看中文阅读版、仓库结构与个人判读。' },
];
