import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  catalog,
  categories,
  hasImage,
  thumbnailUrl,
} from '@personal-design/layout-compositions';
import { LayoutGallery, type GalleryItem } from '@/components/layout-gallery';
import { Attribution } from '@/components/attribution';

export const metadata: Metadata = {
  title: '布局参考 · 350 种排版构图图鉴',
  description:
    '350 种排版构图，按 8 个一级分类与 33 个二级主题组织，可浏览、可检索、可下载。',
};

// 只把客户端需要的字段传下去，控制 RSC 负载
const items: GalleryItem[] = catalog.map((item) => ({
  id: item.id,
  name: item.name,
  categorySlug: item.category_slug,
  subcategory: item.subcategory,
  subcategorySlug: item.subcategory_slug,
  thumb: thumbnailUrl(item),
  hasImage: hasImage(item),
}));

const categoryTabs = categories.map((category) => ({
  slug: category.slug,
  name: category.name,
  count: category.count,
}));

export default function LayoutCompositionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <nav className="flex items-center gap-1 text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-900">
          产品集
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neutral-900">布局参考</span>
      </nav>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          布局参考
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
          350 种排版构图，按 8 个一级分类与 33 个二级主题组织。点击缩略图查看
          1086 × 1448 高清图。
        </p>
      </header>

      <LayoutGallery categories={categoryTabs} items={items} />

      <footer className="mt-16 border-t border-neutral-200 pt-6">
        <Attribution />
      </footer>
    </main>
  );
}
