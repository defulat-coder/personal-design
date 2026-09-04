/**
 * 产品注册表 —— 产品集首页的数据源。
 * 新增产品：在 packages/ 建内容包、在 app/products/<slug>/ 建页面，
 * 然后在这里注册一条。
 */
export type LineId = 'muse' | 'layouts';

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** 上线日期（ISO），首页时间轴按它排序 */
  date: string;
  href: string;
  /** 首页卡片封面图（public 下路径） */
  cover: string;
  stats: string[];
  /** 所属线路（映射 globals.css 的 --color-line-* token） */
  line: LineId;
}

/** 按上线日期升序 */
export const products: Product[] = [
  {
    slug: 'layout-compositions',
    name: '布局参考',
    tagline: '350 种排版构图图鉴',
    description:
      '从经典构图、视觉原则到出版广告、字体网格、网页 UI、影视画面、中国传统构图与演示文稿，按 8 个分类与 33 个主题组织的排版知识图鉴。',
    date: '2026-09-03',
    href: '/products/layout-compositions',
    cover: '/layout-compositions/images/01-composition-logic/001.webp',
    stats: ['8 个分类', '33 个主题', '350 张高清图'],
    line: 'layouts' as const,
  },
  {
    slug: 'muse',
    name: '灵感集',
    tagline: '设计灵感同步库',
    description:
      '持续同步的设计灵感集，图片与视频全部本地化存储，每条都可查看完整的原始信息与作者出处。',
    date: '2026-09-03',
    href: '/products/muse',
    cover: '/inspora/images/54c9d760-395c-4ff7-8446-4432034d9f44.webp',
    stats: [],
    line: 'muse' as const,
  },
].sort((a, b) => a.date.localeCompare(b.date));
