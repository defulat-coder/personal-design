'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LightboxProvider, useLightbox } from './lifeline/lightbox';

/**
 * 图版拼幅（测绘图卷的内容展示统一式）：
 * 分类 tab + CSS columns 大图拼幅，图版四角带套准十字。
 * 图片开灯箱连续翻，视频条目直进详情；滚动到底自动追加。
 */

export interface PlateWallItem {
  key: string;
  /** 所属分类（tab 过滤依据） */
  category: string;
  /** 桩号（有编号体系时显示的编号，墨色） */
  no?: string;
  /** caption 前缀（如作者名） */
  lead?: string;
  name: string;
  /** 右侧 mono 辅助信息（主题 / 日期） */
  sub?: string;
  href: string;
  kind: 'image' | 'video';
  /** image: 缩略图；video: mp4 */
  src: string;
  poster?: string | null;
  /** 灯箱大图（缺省用 src） */
  fullSrc?: string;
  width: number;
  height: number;
  mediaCount?: number;
  /** 搜索匹配用的附加词（主题名等） */
  keywords?: string;
}

interface PlateWallProps {
  categories: { name: string; count: number }[];
  items: PlateWallItem[];
  /** 传了才显示搜索框 */
  searchPlaceholder?: string;
  /** 首屏与每批数量 */
  batchSize?: number;
}

const DEFAULT_BATCH = 48;

export function PlateWall(props: PlateWallProps) {
  return (
    <LightboxProvider>
      <Wall {...props} />
    </LightboxProvider>
  );
}

function Wall({
  categories,
  items,
  searchPlaceholder,
  batchSize = DEFAULT_BATCH,
}: PlateWallProps) {
  const lightbox = useLightbox();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = searchParams.get('cat') ?? '全部';
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [shown, setShown] = useState(batchSize);

  const filtered = useMemo(() => {
    const byCat = active === '全部' ? items : items.filter((i) => i.category === active);
    const keyword = query.trim().toLowerCase();
    if (!keyword) return byCat;
    return byCat.filter(
      (i) =>
        i.name.toLowerCase().includes(keyword) ||
        (i.no ?? '').includes(keyword) ||
        (i.lead ?? '').toLowerCase().includes(keyword) ||
        (i.keywords ?? '').toLowerCase().includes(keyword),
    );
  }, [active, query, items]);

  const visible = filtered.slice(0, shown);

  // 切分类/搜索时重置分批（render 期间调整 state，避免 effect 级联）
  const filterKey = `${active}|${query.trim()}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setShown(batchSize);
  }

  // URL 状态同步（replace 不产生历史记录）
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const q = query.trim();
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    if (active !== '全部') {
      params.set('cat', active);
    } else {
      params.delete('cat');
    }
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    }
  }, [query, active, searchParams, router, pathname]);

  // 无限追加
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown((n) => Math.min(n + batchSize, filtered.length));
        }
      },
      { rootMargin: '800px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered.length, batchSize]);

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

  const openItem = (item: PlateWallItem, sourceEl: HTMLElement) => {
    // 图片开灯箱（siblings = 当前过滤结果里的图片条目）；视频进详情页播放
    if (item.kind !== 'image' || !lightbox) {
      router.push(item.href);
      return;
    }
    const images = filtered.filter((i) => i.kind === 'image');
    lightbox.open(
      {
        src: item.fullSrc ?? item.src,
        thumb: item.src,
        alt: item.name,
        serial: item.no,
        href: item.href,
      },
      {
        rect: sourceEl.getBoundingClientRect(),
        sourceEl,
        siblings: images.map((i) => ({
          src: i.fullSrc ?? i.src,
          thumb: i.src,
          alt: i.name,
          serial: i.no,
          href: i.href,
        })),
        index: images.findIndex((i) => i.key === item.key),
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <nav aria-label="分类" className="flex flex-wrap gap-1.5">
          {[{ name: '全部', count: items.length }, ...categories].map((category) => (
            <button
              key={category.name}
              type="button"
              aria-current={active === category.name || undefined}
              onClick={() => select(category.name)}
              className={cn(
                'relative px-1.5 py-1.5 text-[12px] transition-colors',
                active === category.name
                  ? 'font-semibold text-ink after:absolute after:right-1.5 after:bottom-0 after:left-1.5 after:h-0.5 after:bg-line-muse'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              {category.name}
              <span className="ml-1.5 font-mono text-[11.5px] opacity-60">
                {category.count}
              </span>
            </button>
          ))}
        </nav>
        {searchPlaceholder ? (
          <label className="relative ml-auto block w-56 max-w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full border border-hairline bg-plate py-2 pr-3 pl-9 text-[12.5px] outline-none placeholder:text-ink-faint focus:border-ink"
            />
          </label>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-[12.5px] text-ink-faint">
          没有匹配「{query}」的图版
        </p>
      ) : (
        <div className="mt-6 columns-2 gap-5 pb-10 lg:columns-3 2xl:columns-4">
          {visible.map((item) => (
            <PlateCell key={item.key} item={item} onOpen={openItem} />
          ))}
        </div>
      )}

      {visible.length < filtered.length ? (
        <div ref={sentinelRef} className="flex justify-center pb-10">
          <span className="font-mono text-[11.5px] text-ink-faint">
            {visible.length} / {filtered.length}
          </span>
        </div>
      ) : null}
    </>
  );
}

function PlateCell({
  item,
  onOpen,
}: {
  item: PlateWallItem;
  onOpen: (item: PlateWallItem, sourceEl: HTMLElement) => void;
}) {
  return (
    <figure className="mb-7 break-inside-avoid">
      <button
        type="button"
        aria-label={
          item.kind === 'image' ? `放大查看 ${item.name}` : `播放 ${item.name}`
        }
        onClick={(event) => onOpen(item, event.currentTarget)}
        className="plate-reg group relative block w-full cursor-zoom-in border border-hairline bg-plate p-1.5 outline-none focus-visible:outline-2 focus-visible:outline-ink"
      >
        <span aria-hidden className="plate-reg-marks" />
        <span
          className="relative block overflow-hidden bg-paper"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        >
          {item.kind === 'video' ? (
            <PlateVideo src={item.src} poster={item.poster ?? null} name={item.name} />
          ) : (
            <Image
              src={item.src}
              alt={item.name}
              fill
              sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-(--dur-base) group-hover:scale-[1.02]"
            />
          )}
        </span>
        {item.mediaCount && item.mediaCount > 1 ? (
          <span className="absolute top-3 right-3 border border-hairline bg-plate px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
            {item.mediaCount}
          </span>
        ) : null}
      </button>
      <figcaption className="mt-2 flex items-baseline gap-2">
        {item.no ? (
          <span className="shrink-0 font-mono text-[11.5px] text-ink">{item.no}</span>
        ) : null}
        {item.lead ? (
          <span className="shrink-0 font-mono text-[11.5px] text-ink-faint">
            {item.lead}
          </span>
        ) : null}
        <Link
          href={item.href}
          className="min-w-0 truncate text-[14px] font-medium tracking-[-0.01em] underline-offset-2 hover:underline"
        >
          {item.name}
        </Link>
        {item.sub ? (
          <span className="ml-auto shrink-0 font-mono text-[11.5px] text-ink-faint">
            {item.sub}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** 可视时自动播放、离开即暂停的静音循环视频 */
function PlateVideo({
  src,
  poster,
  name,
}: {
  src: string;
  poster: string | null;
  name: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster ?? undefined}
      aria-label={name}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      className="absolute inset-0 size-full object-cover"
    />
  );
}
