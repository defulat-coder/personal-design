import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  catalog,
  categories,
  hasImage,
  thumbnailUrl,
} from '@personal-design/layout-compositions';
import { LayoutWall, type LayoutWallItem } from '@/components/layout-wall';

export const metadata: Metadata = {
  title: '布局参考 · 350 种排版构图图鉴',
  description:
    '排版构图图鉴：按分类、主题与关键词检索，查看图鉴与高清资源。',
};

// 只把客户端需要的字段传下去，控制 RSC 负载
const items: LayoutWallItem[] = catalog.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  theme: item.subcategory,
  themeSlug: item.subcategory_slug,
  thumb: hasImage(item) ? thumbnailUrl(item) : null,
}));

const tabs = categories.map((category) => ({
  name: category.name,
  count: items.filter((item) => item.category === category.name).length,
}));

const themeCount = categories.reduce(
  (sum, category) => sum + category.subcategories.length,
  0,
);

export default function LayoutCompositionsPage() {
  return (
    <main >
      {/* LayoutWall 内用 useSearchParams 读分类，需要 Suspense 边界 */}
      <Suspense fallback={<p className="p-6 text-ink-soft" role="status">正在加载布局图鉴…</p>}>
        <LayoutWall categories={tabs} items={items} themeCount={themeCount} />
      </Suspense>
    </main>
  );
}
