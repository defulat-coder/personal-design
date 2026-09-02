/**
 * 产品注册表 —— 产品集首页的数据源。
 * 新增产品：在 packages/ 建内容包、在 app/products/<slug>/ 建页面，
 * 然后在这里注册一条。
 */
export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  /** 首页卡片封面图（public 下路径） */
  cover: string;
  stats: string[];
}

export const products: Product[] = [
  {
    slug: 'layout-compositions',
    name: '布局参考',
    tagline: '350 种排版构图图鉴',
    description:
      '从经典构图、视觉原则到出版广告、字体网格、网页 UI、影视画面、中国传统构图与演示文稿，按 8 个分类与 33 个主题组织的排版知识图鉴。',
    href: '/products/layout-compositions',
    cover: '/layout-compositions/thumbnails/01-composition-logic/001.webp',
    stats: ['8 个分类', '33 个主题', '350 张高清图'],
  },
];
