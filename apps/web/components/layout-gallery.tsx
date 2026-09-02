'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GalleryItem {
  id: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  thumb: string;
  hasImage: boolean;
}

interface CategoryTab {
  slug: string;
  name: string;
  count: number;
}

interface Section {
  key: string;
  title: string;
  items: GalleryItem[];
}

export function LayoutGallery({
  categories,
  items,
}: {
  categories: CategoryTab[];
  items: GalleryItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.slug ?? '',
  );
  const [query, setQuery] = useState('');

  const sections = useMemo<Section[]>(() => {
    const keyword = query.trim().toLowerCase();

    // 搜索时跨所有分类匹配编号 / 名称，按一级分类分组
    if (keyword) {
      const matched = items.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) || item.id.includes(keyword),
      );
      const grouped = new Map<string, GalleryItem[]>();
      for (const item of matched) {
        const list = grouped.get(item.categorySlug) ?? [];
        list.push(item);
        grouped.set(item.categorySlug, list);
      }
      return categories
        .filter((category) => grouped.has(category.slug))
        .map((category) => ({
          key: category.slug,
          title: category.name,
          items: grouped.get(category.slug) ?? [],
        }));
    }

    // 默认按当前一级分类下的二级主题分组
    const inCategory = items.filter(
      (item) => item.categorySlug === activeCategory,
    );
    const grouped = new Map<string, GalleryItem[]>();
    for (const item of inCategory) {
      const list = grouped.get(item.subcategorySlug) ?? [];
      list.push(item);
      grouped.set(item.subcategorySlug, list);
    }
    const sections: Section[] = [];
    for (const [slug, list] of grouped) {
      sections.push({
        key: slug,
        title: list[0]?.subcategory ?? slug,
        items: list,
      });
    }
    return sections;
  }, [activeCategory, query, items, categories]);

  const totalShown = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="一级分类"
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <button
              key={category.slug}
              role="tab"
              aria-selected={activeCategory === category.slug}
              onClick={() => {
                setActiveCategory(category.slug);
                setQuery('');
              }}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                activeCategory === category.slug && !query
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400',
              )}
            >
              {category.name}
              <span className="ml-1.5 text-xs opacity-60">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        <label className="relative block lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称或编号…"
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pr-4 pl-9 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
        </label>
      </div>

      {totalShown === 0 ? (
        <p className="mt-20 text-center text-sm text-neutral-400">
          没有匹配「{query}」的排版
        </p>
      ) : (
        sections.map((section) => (
          <section key={section.key} className="mt-12">
            <h2 className="flex items-baseline gap-2 text-base font-medium">
              {section.title}
              <span className="text-xs font-normal text-neutral-400">
                {section.items.length} 种
              </span>
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/layout-compositions/${item.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {item.hasImage ? (
                      <Image
                        src={item.thumb}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-200 text-neutral-300">
                        <span className="font-mono text-2xl">{item.id}</span>
                        <span className="text-xs">图片缺失</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-5">
                    <span className="mr-1.5 font-mono text-xs text-neutral-400">
                      {item.id}
                    </span>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
