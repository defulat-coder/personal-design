import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight, Download } from 'lucide-react';
import {
  catalog,
  getLayoutById,
  hasImage,
  imageUrl,
  thumbnailUrl,
  type LayoutItem,
} from '@personal-design/layout-compositions';
import { Attribution } from '@/components/attribution';
import { DetailKeyboardNav, DetailMainImage } from '@/components/detail-tools';
import type { LightboxItem } from '@/components/lifeline/lightbox';

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map((item) => ({ id: item.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getLayoutById(id);
  if (!item) return {};
  return {
    title: `${item.id} ${item.name} · 布局参考`,
    description: `${item.name} —— ${item.category} / ${item.subcategory}，350 种排版构图图鉴。`,
  };
}

const detailHref = (item: LayoutItem) =>
  `/products/layout-compositions/${item.id}`;

/** prev/next 的缩略图小卡片（限同二级主题） */
function NavCard({ item, dir }: { item: LayoutItem; dir: 'prev' | 'next' }) {
  return (
    <Link
      href={detailHref(item)}
      className="group flex items-center gap-3 rounded-lg border border-neutral-200 p-2 transition active:scale-[0.98] hover:border-neutral-400"
    >
      {dir === 'prev' ? (
        <ArrowLeft className="ml-1 size-4 shrink-0 text-neutral-400 transition-transform group-hover:-translate-x-0.5" />
      ) : null}
      <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white">
        {hasImage(item) ? (
          <Image
            src={thumbnailUrl(item)}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-mono text-[9px] text-neutral-300">
            {item.id}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs text-neutral-400">
          {dir === 'prev' ? '上一张 · ' : '下一张 · '}
          {item.id}
        </span>
        <span className="block truncate text-sm">{item.name}</span>
      </span>
      {dir === 'next' ? (
        <ArrowRight className="mr-1 size-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
      ) : null}
    </Link>
  );
}

export default async function LayoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = getLayoutById(id);
  if (!item) notFound();

  // 翻页与灯箱上下文都限定在同二级主题内（不跨主题跳页）
  const group = catalog.filter(
    (entry) => entry.subcategory_slug === item.subcategory_slug,
  );
  const indexInGroup = group.findIndex((entry) => entry.id === item.id);
  const prev = indexInGroup > 0 ? group[indexInGroup - 1] : undefined;
  const next =
    indexInGroup >= 0 && indexInGroup < group.length - 1
      ? group[indexInGroup + 1]
      : undefined;

  const available = hasImage(item);
  const src = available ? imageUrl(item) : null;
  // 列表页 ?cat= 恢复链路：面包屑与一级分类 chip 共用
  const categoryHref = `/products/layout-compositions?cat=${item.category_slug}`;

  const withImage = group.filter((entry) => hasImage(entry));
  const siblings: LightboxItem[] = withImage.map((entry) => ({
    src: imageUrl(entry),
    thumb: thumbnailUrl(entry),
    alt: entry.name,
    serial: entry.id,
    href: detailHref(entry),
  }));
  const lightboxIndex = withImage.findIndex((entry) => entry.id === item.id);

  // 同主题推荐：当前条目前后最近的 6 张（有图的）
  const related = [
    ...group.slice(Math.max(0, indexInGroup - 3), indexInGroup),
    ...group.slice(indexInGroup + 1, indexInGroup + 7),
  ]
    .filter((entry) => hasImage(entry))
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <nav className="flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">
          产品集
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={categoryHref} className="hover:text-neutral-900">
          布局参考
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neutral-900">
          {item.id} {item.name}
        </span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="detail-in relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:aspect-auto lg:h-[calc(100dvh-12rem)]">
          {src ? (
            <DetailMainImage
              src={src}
              thumb={thumbnailUrl(item)}
              alt={item.name}
              serial={item.id}
              siblings={siblings}
              index={lightboxIndex}
            />
          ) : (
            <div className="absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-200 text-neutral-300">
              <span className="font-mono text-4xl">{item.id}</span>
              <span className="text-sm">上游图片缺失</span>
            </div>
          )}
        </div>

        <div className="detail-in detail-in-delay flex flex-col">
          <p className="font-mono text-sm text-neutral-400">
            {item.id} / {catalog.length}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {item.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <Link
              href={categoryHref}
              className="rounded-full border border-neutral-200 px-2.5 py-0.5"
            >
              {item.category}
            </Link>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5">
              {item.subcategory}
            </span>
            <span className="text-neutral-400">
              {item.width} × {item.height}
            </span>
          </div>

          {src && (
            <a
              href={src}
              download={`${item.id}-${item.name}.webp`}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm text-white transition active:scale-[0.97] hover:bg-neutral-700"
            >
              <Download className="size-4" />
              下载高清图
            </a>
          )}

          {prev || next ? (
            <nav
              aria-label="同主题翻页"
              className="mt-8 flex flex-col gap-2 border-t border-neutral-200 pt-6"
            >
              {prev ? <NavCard item={prev} dir="prev" /> : null}
              {next ? <NavCard item={next} dir="next" /> : null}
            </nav>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h2 className="text-sm font-medium text-neutral-700">
                同主题 · {item.subcategory}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {related.map((entry) => (
                  <Link
                    key={entry.id}
                    href={detailHref(entry)}
                    className="group"
                    title={`${entry.id} ${entry.name}`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-neutral-200 bg-white transition active:scale-[0.97]">
                      <Image
                        src={thumbnailUrl(entry)}
                        alt={entry.name}
                        fill
                        sizes="(min-width: 1024px) 140px, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <span className="mt-1 block font-mono text-[10px] text-neutral-400">
                      {entry.id}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <DetailKeyboardNav
        prevHref={prev ? detailHref(prev) : undefined}
        nextHref={next ? detailHref(next) : undefined}
      />

      <footer className="mt-16 border-t border-neutral-200 pt-6">
        <Attribution />
      </footer>
    </main>
  );
}
