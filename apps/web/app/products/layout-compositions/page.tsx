import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  catalog,
  categories,
  hasImage,
  imageUrl,
  thumbnailUrl,
} from '@personal-design/layout-compositions';
import { LayoutWall, type LayoutWallItem } from '@/components/layout-wall';

export const metadata: Metadata = {
  title: '布局参考 · 350 种排版构图图鉴',
  description:
    '350 种排版构图的暗房灵感墙：两行反向慢速流动，悬停暂停、点击放大，按分类重发。',
};

// 只把客户端需要的字段传下去，控制 RSC 负载
const items: LayoutWallItem[] = catalog.flatMap((item) => {
  if (!hasImage(item)) return [];
  return [
    {
      id: item.id,
      name: item.name,
      category: item.category,
      thumb: thumbnailUrl(item),
      full: imageUrl(item),
    },
  ];
});

const tabs = categories.map((category) => ({
  name: category.name,
  count: category.count,
}));

const themeCount = categories.reduce(
  (sum, category) => sum + category.subcategories.length,
  0,
);

export default function LayoutCompositionsPage() {
  return (
    <main className="h-dvh">
      {/* LayoutWall 内用 useSearchParams 读分类，需要 Suspense 边界 */}
      <Suspense fallback={null}>
        <LayoutWall categories={tabs} items={items} themeCount={themeCount} />
      </Suspense>
    </main>
  );
}
