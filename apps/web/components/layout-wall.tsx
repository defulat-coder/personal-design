'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { LightboxProvider, useLightbox } from './lifeline/lightbox';

/**
 * 布局参考的暗房灵感墙：两行反向慢速 marquee（悬停暂停、点击放大），
 * 顶部分类 tab 点击即用该分类重发两行（key 重挂载，marquee 从头开始）。
 * 第 3 轮起页头站牌化（L·01 编号牌 + 底缘线路色带），两行视为「双向行车」，
 * 行首挂 mono 方向标（上行/下行）。
 */

export interface LayoutWallItem {
  id: string;
  name: string;
  category: string;
  thumb: string;
  full: string;
}

interface LayoutWallProps {
  categories: { name: string; count: number }[];
  items: LayoutWallItem[];
  /** 二级主题总数（站牌右侧 mono 数据用，由页面从包的 API 算出） */
  themeCount: number;
}

export function LayoutWall(props: LayoutWallProps) {
  return (
    <LightboxProvider>
      <Wall {...props} />
    </LightboxProvider>
  );
}

function Wall({ categories, items, themeCount }: LayoutWallProps) {
  const lightbox = useLightbox();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = searchParams.get('cat') ?? '全部';

  const filtered =
    active === '全部' ? items : items.filter((i) => i.category === active);
  const half = Math.ceil(filtered.length / 2);
  const rows = [
    { items: filtered.slice(0, half), duration: '75s', reverse: false },
    { items: filtered.slice(half), duration: '95s', reverse: true },
  ];

  const select = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (name === '全部') {
      params.delete('cat');
    } else {
      params.set('cat', name);
    }
    const next = params.toString();
    router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-paper">
      <header className="shrink-0 px-6 pt-6 sm:px-10">
        {/* 站牌式刊头：返回链接 + L·01 编号牌 + 大字站名，底缘 3px 线路色带 */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-4">
          <div className="flex flex-col gap-2.5">
            <Link
              href="/"
              className="flex w-fit items-center gap-1.5 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-3.5" />
              产品集
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="bg-line-layouts px-1.5 py-px font-mono text-[10.5px] font-medium text-white dark:text-paper">
                L·01
              </span>
              <h1 className="font-display text-[30px] leading-none font-semibold">
                布局参考
              </h1>
            </div>
          </div>
          <p className="font-mono text-[11.5px] text-ink-soft">
            {items.length} 张图鉴 · {categories.length} 分类 {themeCount} 主题
          </p>
        </div>
        <div aria-hidden className="h-[3px] bg-line-layouts" />

        <nav aria-label="分类" className="mt-3 flex flex-wrap gap-1.5">
          {[{ name: '全部', count: items.length }, ...categories].map(
            (category) => (
              <button
                key={category.name}
                type="button"
                aria-current={active === category.name || undefined}
                onClick={() => select(category.name)}
                className={cn(
                  'relative px-1.5 py-1.5 text-[12px] transition-colors',
                  active === category.name
                    ? 'font-semibold text-ink after:absolute after:right-1.5 after:bottom-0 after:left-1.5 after:h-[2px] after:bg-line-layouts'
                    : 'text-ink-soft hover:text-ink',
                )}
              >
                {category.name}
                <span className="ml-1.5 font-mono text-[11.5px] opacity-60">
                  {category.count}
                </span>
              </button>
            ),
          )}
        </nav>
      </header>

      {/* key 重挂载：切分类时 marquee 从头开始，避免动画位置错乱 */}
      <div
        key={active}
        className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-hidden py-8"
      >
        {rows.map((row, rowIndex) =>
          row.items.length > 0 ? (
            <div key={rowIndex} className="relative">
              {/* 双向行车方向标：挂在行首上缘，不随 marquee 移动 */}
              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-6 z-10 flex -translate-y-1/2 items-center gap-1 bg-paper px-1.5 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint sm:left-10"
              >
                {row.reverse ? null : <ArrowLeft className="size-3" />}
                {row.reverse ? '下行 DOWN' : '上行 UP'}
                {row.reverse ? <ArrowRight className="size-3" /> : null}
              </span>
              <div className="lifeline-marquee-row overflow-hidden">
              <div
                className="lifeline-marquee flex w-max"
                style={
                  {
                    '--dur': row.duration,
                    animationDirection: row.reverse ? 'reverse' : 'normal',
                  } as CSSProperties
                }
              >
                {[...row.items, ...row.items].map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    aria-label={`放大查看 ${item.name}`}
                    className="plate-reg layout-wall-card relative mr-4 aspect-[3/4] w-40 shrink-0 cursor-zoom-in overflow-hidden border border-hairline-strong bg-plate transition-transform duration-(--dur-base) hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-layouts active:scale-95 sm:w-52"
                    onClick={(event) => {
                      const toLightboxItem = (entry: LayoutWallItem) => ({
                        src: entry.full,
                        thumb: entry.thumb,
                        alt: entry.name,
                        serial: entry.id,
                        href: `/products/layout-compositions/${entry.id}`,
                      });
                      lightbox?.open(toLightboxItem(item), {
                        rect: event.currentTarget.getBoundingClientRect(),
                        sourceEl: event.currentTarget,
                        siblings: row.items.map(toLightboxItem),
                        index: index % row.items.length,
                      });
                    }}
                  >
                    <span aria-hidden className="plate-reg-marks" />
                    <Image
                      src={item.thumb}
                      alt={item.name}
                      fill
                      sizes="(min-width: 640px) 208px, 160px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
