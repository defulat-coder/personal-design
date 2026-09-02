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
} from '@personal-design/layout-compositions';
import { Attribution } from '@/components/attribution';

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

export default async function LayoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = getLayoutById(id);
  if (!item) notFound();

  const index = catalog.findIndex((entry) => entry.id === item.id);
  const prev = index > 0 ? catalog[index - 1] : undefined;
  const next = index < catalog.length - 1 ? catalog[index + 1] : undefined;
  const available = hasImage(item);
  const src = available ? imageUrl(item) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <nav className="flex items-center gap-1 text-sm text-neutral-400">
        <Link href="/" className="hover:text-neutral-900">
          产品集
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href="/products/layout-compositions"
          className="hover:text-neutral-900"
        >
          布局参考
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-neutral-900">
          {item.id} {item.name}
        </span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {src ? (
            <Image
              src={src}
              alt={item.name}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 border-2 border-dashed border-neutral-200 text-neutral-300">
              <span className="font-mono text-4xl">{item.id}</span>
              <span className="text-sm">上游图片缺失</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="font-mono text-sm text-neutral-400">{item.id} / 350</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {item.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5">
              {item.category}
            </span>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5">
              {item.subcategory}
            </span>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5">
              {item.width} × {item.height}
            </span>
          </div>

          {src && (
            <a
              href={src}
              download={`${item.id}-${item.name}.webp`}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
            >
              <Download className="size-4" />
              下载高清图
            </a>
          )}

          <div className="mt-auto flex items-center justify-between gap-4 pt-10">
            {prev ? (
              <Link
                href={`/products/layout-compositions/${prev.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
              >
                <ArrowLeft className="size-4" />
                {prev.id} {prev.name}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/products/layout-compositions/${next.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
              >
                {next.id} {next.name}
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-neutral-200 pt-6">
        <Attribution />
      </footer>
    </main>
  );
}
