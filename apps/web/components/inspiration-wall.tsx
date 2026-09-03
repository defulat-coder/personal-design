'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { Attribution } from '@/components/attribution';
import { useLightbox } from './lifeline/lightbox';

export interface WallItem {
  id: string;
  name: string;
  thumb: string;
  full: string;
}

/**
 * 撕角撕开后露出的灵感墙：暗房反转层（与首页浅色形成明暗对比），
 * 两行反向慢速 marquee，悬停暂停，点击放大。
 */
export function InspirationWall({ items }: { items: WallItem[] }) {
  const lightbox = useLightbox();
  const half = Math.ceil(items.length / 2);
  const rows = [
    { items: items.slice(0, half), duration: '75s', reverse: false },
    { items: items.slice(half), duration: '95s', reverse: true },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-neutral-950">
      <header className="shrink-0 px-6 pt-10 sm:px-10">
        <p className="text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase">
          Playground
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          灵感墙
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          <span className="hidden [@media(hover:hover)]:inline">
            从「布局参考」里捞出来的构图，悬停暂停、点击放大。从左下角把页面拉回去。
          </span>
          <span className="[@media(hover:hover)]:hidden">
            从「布局参考」里捞出来的构图，点击放大。从左下角把页面拉回去。
          </span>
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-hidden py-8">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="lifeline-marquee-row overflow-hidden">
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
                  className="relative mr-4 aspect-[3/4] w-40 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-transform duration-300 hover:scale-[1.03] active:scale-95 sm:w-52"
                  onClick={(event) => {
                    const toLightboxItem = (entry: WallItem) => ({
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
        ))}
      </div>

      <footer className="shrink-0 px-6 pb-4 sm:px-10">
        <Attribution />
      </footer>
    </div>
  );
}
