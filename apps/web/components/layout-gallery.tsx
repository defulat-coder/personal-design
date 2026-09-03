'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LifelineNode,
  LifelineTimeline,
  type LifelineTimelineApi,
} from './lifeline/timeline';
import {
  HoverPreviewProvider,
  useHoverPreview,
} from './lifeline/hover-preview';
import { LightboxProvider, useLightbox } from './lifeline/lightbox';

export interface GalleryItem {
  id: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
  thumb: string;
  full: string;
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

const SEARCH_SUGGESTIONS = ['构图', '网格', '跨页', '留白'];

/**
 * 二级主题 chips：渲染在节点列头插槽（常驻可见），点击 rAF tween 锚点直达；
 * 列内 scroll 感应高亮（h3 sticky 对 IO 不可信，用 scrollTop 比较锚点）。
 */
function SubChipsBar({ groups }: { groups: { slug: string; name: string }[] }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState(groups[0]?.slug ?? '');
  const [overflow, setOverflow] = useState(false);
  const tweenRef = useRef(0);
  // tween 期间的点击意图锁：scroll 感应不抢高亮（终点一致后自然同步）
  const intentRef = useRef(false);

  const getColumn = useCallback(
    () =>
      barRef.current
        ?.closest('section')
        ?.querySelector<HTMLElement>('[data-lifeline-column]') ?? null,
    [],
  );

  // 溢出检测（右缘渐隐只在内容超宽时启用）
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const update = () => setOverflow(bar.scrollWidth > bar.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // 横向滚轮：chips 条可横滑时拦截 deltaX，不放大成整轴位移
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const atLeft = bar.scrollLeft <= 0 && event.deltaX < 0;
      const atRight =
        bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 1 &&
        event.deltaX > 0;
      if (atLeft || atRight) return;
      event.preventDefault();
      event.stopPropagation();
      bar.scrollLeft += event.deltaX;
    };
    bar.addEventListener('wheel', onWheel, { passive: false });
    return () => bar.removeEventListener('wheel', onWheel);
  }, []);

  // 列内 scroll 感应高亮（rAF 节流）
  useEffect(() => {
    const column = getColumn();
    if (!column) return;
    let raf = 0;
    let anchors: { slug: string; top: number }[] = [];
    const measure = () => {
      anchors = [
        ...column.querySelectorAll<HTMLElement>('[data-sub-slug]'),
      ].map((el) => ({ slug: el.dataset.subSlug ?? '', top: el.offsetTop }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (intentRef.current) return;
        const y = column.scrollTop + column.offsetTop;
        let current = anchors[0]?.slug;
        for (const anchor of anchors) {
          if (anchor.top <= y + 4) {
            current = anchor.slug;
          } else {
            break;
          }
        }
        if (current) setActiveSlug(current);
      });
    };
    column.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      column.removeEventListener('scroll', onScroll);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [getColumn]);

  // active chip 保持在可视区——只滚 chips 条自身，绝不用 scrollIntoView
  // （scrollIntoView 会滚动所有可滚动祖先，包括时间轴容器，曾污染首屏落点）
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(
      `[data-chip-slug="${activeSlug}"]`,
    );
    if (!bar || !chip) return;
    const chipLeft = chip.offsetLeft - bar.offsetLeft;
    const chipRight = chipLeft + chip.offsetWidth;
    if (chipLeft < bar.scrollLeft) {
      bar.scrollLeft = chipLeft - 8;
    } else if (chipRight > bar.scrollLeft + bar.clientWidth) {
      bar.scrollLeft = chipRight - bar.clientWidth + 8;
    }
  }, [activeSlug]);

  const scrollToGroup = (slug: string) => {
    const column = getColumn();
    const target = column?.querySelector<HTMLElement>(
      `[data-sub-slug="${slug}"]`,
    );
    if (!column || !target) return;
    setActiveSlug(slug);
    const to = Math.min(
      target.offsetTop - column.offsetTop,
      column.scrollHeight - column.clientHeight,
    );
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      column.scrollTop = to;
      return;
    }
    // 手写 rAF tween：时长随距离封顶（260–550ms），短跳长跳手感一致
    cancelAnimationFrame(tweenRef.current);
    intentRef.current = true;
    const from = column.scrollTop;
    const dist = to - from;
    const duration = Math.min(Math.max(200 + Math.abs(dist) * 0.1, 260), 550);
    let start: number | undefined;
    const step = (now: number) => {
      start ??= now;
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      column.scrollTop = from + dist * eased;
      if (p < 1) {
        tweenRef.current = requestAnimationFrame(step);
      } else {
        intentRef.current = false;
      }
    };
    tweenRef.current = requestAnimationFrame(step);
  };

  return (
    <nav
      ref={barRef}
      aria-label="二级主题"
      className={cn(
        'flex h-9 items-center gap-1.5 overflow-x-auto pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        overflow &&
          '[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]',
      )}
    >
      {groups.map((group) => (
        <button
          key={group.slug}
          type="button"
          aria-current={activeSlug === group.slug || undefined}
          data-chip-slug={group.slug}
          onClick={() => scrollToGroup(group.slug)}
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-0.5 text-xs whitespace-nowrap transition active:scale-[0.97]',
            activeSlug === group.slug
              ? 'border-neutral-900 text-neutral-900'
              : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400',
          )}
        >
          {group.name}
        </button>
      ))}
    </nav>
  );
}

export function LayoutGallery({
  categories,
  items,
}: {
  categories: CategoryTab[];
  items: GalleryItem[];
}) {
  return (
    <HoverPreviewProvider>
      <LightboxProvider>
        <GalleryContent categories={categories} items={items} />
      </LightboxProvider>
    </HoverPreviewProvider>
  );
}

function GalleryContent({
  categories,
  items,
}: {
  categories: CategoryTab[];
  items: GalleryItem[];
}) {
  const preview = useHoverPreview();
  const lightbox = useLightbox();
  const timelineRef = useRef<LifelineTimelineApi>(null);
  const pendingNodeRef = useRef<number | null>(null);
  const intentLockRef = useRef(false);
  const didRestoreRef = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('cat') ?? categories[0]?.slug ?? '',
  );
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const searching = query.trim().length > 0;
  // 进入过搜索态后，时间轴重挂载（退出搜索）跳过入场级联动画；
  // 不能在首次挂载后置位——animation:none 会立刻掐断正在播放的首屏入场
  const [timelineReentry, setTimelineReentry] = useState(false);
  useEffect(() => {
    if (!searching) return;
    const raf = requestAnimationFrame(() => setTimelineReentry(true));
    return () => cancelAnimationFrame(raf);
  }, [searching]);
  // 供 effect 读最新 activeCategory 而不把它列入依赖（避免 IO 高亮变化触发滚动）
  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // 从 URL 恢复分类现场（浏览器返回/分享链接进入时；activeCategory 已在初始 state 读取）
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    const cat = searchParams.get('cat');
    if (!cat || query.trim()) return;
    const index = categories.findIndex((c) => c.slug === cat);
    if (index <= 0) return;
    intentLockRef.current = true;
    requestAnimationFrame(() => timelineRef.current?.scrollToNode(index));
  }, [searchParams, categories, query]);

  // 浏览状态同步 URL（replace 不产生历史记录，返回键恢复现场）
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const q = query.trim();
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    if (activeCategory && activeCategory !== categories[0]?.slug) {
      params.set('cat', activeCategory);
    } else {
      params.delete('cat');
    }
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    }
  }, [query, activeCategory, searchParams, router, pathname, categories]);

  // 搜索视图：匹配名称 / 编号 / 二级主题 / 一级分类名，按一级分类分组平铺
  const sections = useMemo<Section[]>(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
    const matched = items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.id.includes(keyword) ||
        item.subcategory.toLowerCase().includes(keyword) ||
        (categoryName.get(item.categorySlug)?.toLowerCase().includes(keyword) ??
          false),
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
  }, [query, items, categories]);

  // 时间轴视图：一级分类 → 二级主题 → 条目
  const timelineGroups = useMemo(() => {
    const map = new Map<string, Map<string, GalleryItem[]>>();
    for (const item of items) {
      let subs = map.get(item.categorySlug);
      if (!subs) {
        subs = new Map();
        map.set(item.categorySlug, subs);
      }
      const list = subs.get(item.subcategorySlug) ?? [];
      list.push(item);
      subs.set(item.subcategorySlug, list);
    }
    return map;
  }, [items]);

  // 节点进入视口时同步高亮对应 tab
  useEffect(() => {
    if (searching) return;
    const nodes = document.querySelectorAll<HTMLElement>('[data-node-index]');
    if (nodes.length === 0) return;
    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.nodeIndex,
          );
          ratios.set(
            index,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        // 用户刚点了 tab：尊重点击意图，不被 IO 改写（手动滚动时解锁）
        if (intentLockRef.current) return;
        // 全部节点里取可见率最高者（并列取最靠左），避免只看本批次的滞留/偏格
        let best = -1;
        let bestRatio = 0.2;
        for (const [index, ratio] of ratios) {
          if (
            ratio > bestRatio ||
            (ratio === bestRatio && (best < 0 || index < best))
          ) {
            best = index;
            bestRatio = ratio;
          }
        }
        const slug = best >= 0 ? categories[best]?.slug : undefined;
        if (slug) setActiveCategory(slug);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [searching, categories]);

  // active tab 保持在 tab 栏可视区内（移动端 tab 栏横向滚动）
  useEffect(() => {
    document
      .querySelector(`[data-tab-slug="${activeCategory}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeCategory]);

  // 搜索态点 tab：先退出搜索，待时间轴重新挂载后再滚动到目标节点
  useEffect(() => {
    if (searching) return;
    if (pendingNodeRef.current !== null) {
      const index = pendingNodeRef.current;
      pendingNodeRef.current = null;
      requestAnimationFrame(() => timelineRef.current?.scrollToNode(index));
      return;
    }
    // 兜底：清空搜索退出时，时间轴重挂载在起点，对齐 active tab / URL 的分类落点
    // （首次挂载的 ?cat= 恢复由 didRestoreRef 守卫的 restore effect 负责，目标是同一节点，不冲突）
    const index = categories.findIndex(
      (c) => c.slug === activeCategoryRef.current,
    );
    if (index > 0) {
      intentLockRef.current = true;
      requestAnimationFrame(() => timelineRef.current?.scrollToNode(index));
    }
  }, [searching, categories]);

  const handleTabClick = (slug: string, index: number) => {
    intentLockRef.current = true;
    setActiveCategory(slug);
    if (searching) {
      pendingNodeRef.current = index;
      setQuery('');
    } else {
      timelineRef.current?.scrollToNode(index);
    }
  };

  // 手动滚轮/拖拽/键盘滚动时解除点击意图锁，tab 高亮交还给位置感应
  const unlockIntent = () => {
    intentLockRef.current = false;
  };

  const totalShown = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  // 搜索网格滚动位置：按关键词存 sessionStorage，从详情返回时恢复
  const searchScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!searching) return;
    const el = searchScrollRef.current;
    if (!el) return;
    const key = `gallery-search-scroll:${query.trim()}`;
    const saved = sessionStorage.getItem(key);
    // 有记忆恢复记忆；新关键词（无记忆）显式归零，不停留在旧列表深处
    el.scrollTop = saved ? Number(saved) : 0;
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => sessionStorage.setItem(key, String(el.scrollTop)),
        150,
      );
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, [searching, query, totalShown]);

  // 一级 tab 栏溢出检测（与 SubChipsBar 同口径：右缘渐隐只在内容超宽时启用；
  // lg 折行后 scrollWidth 不超 clientWidth，mask 自然失效）
  const tabBarRef = useRef<HTMLElement>(null);
  const [tabOverflow, setTabOverflow] = useState(false);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const update = () => setTabOverflow(bar.scrollWidth > bar.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav
          ref={tabBarRef}
          aria-label="一级分类"
          className={cn(
            'flex gap-2 overflow-x-auto pb-1 pr-4 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden',
            tabOverflow &&
              '[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]',
          )}
        >
          {categories.map((category, index) => (
            <button
              key={category.slug}
              data-tab-slug={category.slug}
              aria-current={activeCategory === category.slug || undefined}
              onClick={() => handleTabClick(category.slug, index)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition active:scale-[0.97]',
                activeCategory === category.slug
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
        </nav>

        <label className="relative block lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称、编号或主题…"
            className="w-full rounded-full border border-neutral-200 bg-white py-2 pr-4 pl-9 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-900"
          />
        </label>
      </div>

      {searching ? (
        <div
          ref={searchScrollRef}
          className="mt-4 min-h-0 flex-1 overflow-y-auto pb-10"
        >
          {totalShown === 0 ? (
            <div className="mt-20 flex flex-col items-center gap-4">
              <p className="text-sm text-neutral-500">
                没有匹配「{query}」的排版
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SEARCH_SUGGESTIONS.map((word) => (
                  <button
                    key={word}
                    onClick={() => setQuery(word)}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 transition active:scale-[0.97] hover:border-neutral-400"
                  >
                    试试「{word}」
                  </button>
                ))}
                <button
                  onClick={() => setQuery('')}
                  className="rounded-full px-3 py-1 text-xs text-neutral-400 underline underline-offset-2 transition active:scale-[0.97] hover:text-neutral-600"
                >
                  清除搜索
                </button>
              </div>
            </div>
          ) : (
            sections.map((section) => (
              <section key={section.key} className="mt-10">
                <h2 className="flex items-baseline gap-2 text-base font-medium">
                  {section.title}
                  <span className="text-xs font-normal text-neutral-400">
                    {section.items.length} 种
                  </span>
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {section.items.map((item) => (
                    <div key={item.id} className="group">
                      {item.hasImage ? (
                        <button
                          type="button"
                          aria-label={`放大查看 ${item.name}`}
                          className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-xl border border-neutral-200 bg-white transition active:scale-[0.98]"
                          onClick={(event) => {
                            // 与时间轴视图一致：图开灯箱（siblings = 本组有图条目）
                            const withImage = section.items.filter(
                              (entry) => entry.hasImage,
                            );
                            const toLightboxItem = (entry: GalleryItem) => ({
                              src: entry.full,
                              thumb: entry.thumb,
                              alt: entry.name,
                              serial: entry.id,
                              href: `/products/layout-compositions/${entry.id}`,
                            });
                            lightbox?.open(toLightboxItem(item), {
                              rect: event.currentTarget.getBoundingClientRect(),
                              sourceEl: event.currentTarget,
                              siblings: withImage.map(toLightboxItem),
                              index: withImage.findIndex(
                                (entry) => entry.id === item.id,
                              ),
                            });
                          }}
                        >
                          <Image
                            src={item.thumb}
                            alt={item.name}
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </button>
                      ) : (
                        <Link
                          href={`/products/layout-compositions/${item.id}`}
                          className="relative block aspect-[3/4] w-full overflow-hidden rounded-xl border border-neutral-200 bg-white"
                        >
                          <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 text-neutral-300">
                            <span className="font-mono text-2xl">{item.id}</span>
                            <span className="text-xs">图片缺失</span>
                          </div>
                        </Link>
                      )}
                      <Link
                        href={`/products/layout-compositions/${item.id}`}
                        className="mt-2 block text-sm leading-5 underline-offset-2 hover:underline"
                      >
                        <span className="mr-1.5 font-mono text-xs text-neutral-400">
                          {item.id}
                        </span>
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      ) : (
        <div
          className={cn(
            'mt-2 min-h-0 flex-1',
            timelineReentry && 'lifeline-no-entry',
          )}
          onWheelCapture={unlockIntent}
          onPointerDownCapture={unlockIntent}
          onKeyDownCapture={unlockIntent}
        >
          <LifelineTimeline ref={timelineRef}>
            {categories.map((category, index) => {
              const subs = timelineGroups.get(category.slug);
              return (
                <LifelineNode
                  key={category.slug}
                  index={index}
                  label={category.name}
                  sublabel={`${category.count} 种`}
                  header={
                    <SubChipsBar
                      groups={[...(subs?.entries() ?? [])].map(
                        ([slug, list]) => ({
                          slug,
                          name: list[0]?.subcategory ?? slug,
                        }),
                      )}
                    />
                  }
                >
                  {[...(subs?.entries() ?? [])].map(([subSlug, list]) => (
                    <div key={subSlug} data-sub-slug={subSlug} className="mt-5 first:mt-0">
                      <h3 className="sticky top-0 z-10 -mx-1.5 flex items-baseline gap-2 bg-[#fafafa] px-1.5 py-1.5 text-sm font-medium text-neutral-700">
                        {list[0]?.subcategory ?? subSlug}
                        <span className="text-xs font-normal text-neutral-400">
                          {list.length}
                        </span>
                      </h3>
                      <ul className="mt-1.5 space-y-0.5">
                        {list.map((item) => (
                          <li key={item.id}>
                            <div
                              className="group flex items-center gap-3 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-neutral-100 active:bg-neutral-200"
                              onMouseEnter={() =>
                                item.hasImage &&
                                preview?.show(item.thumb, item.name)
                              }
                              onMouseLeave={() => preview?.hide()}
                            >
                              {item.hasImage ? (
                                <button
                                  type="button"
                                  aria-label={`放大查看 ${item.name}`}
                                  className="relative block h-14 w-[42px] shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-neutral-200 bg-white"
                                  onClick={(event) => {
                                    const toLightboxItem = (
                                      entry: GalleryItem,
                                    ) => ({
                                      src: entry.full,
                                      thumb: entry.thumb,
                                      alt: entry.name,
                                      serial: entry.id,
                                      href: `/products/layout-compositions/${entry.id}`,
                                    });
                                    // 左右切换的上下文：同二级主题内有图的条目
                                    const withImage = list.filter(
                                      (entry) => entry.hasImage,
                                    );
                                    lightbox?.open(toLightboxItem(item), {
                                      rect: event.currentTarget.getBoundingClientRect(),
                                      sourceEl: event.currentTarget,
                                      siblings: withImage.map(toLightboxItem),
                                      index: withImage.findIndex(
                                        (entry) => entry.id === item.id,
                                      ),
                                    });
                                  }}
                                >
                                  <Image
                                    src={item.thumb}
                                    alt=""
                                    fill
                                    sizes="42px"
                                    className="object-cover"
                                  />
                                </button>
                              ) : (
                                <span className="relative block h-14 w-[42px] shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
                                  <span className="flex h-full items-center justify-center font-mono text-[10px] text-neutral-300">
                                    {item.id}
                                  </span>
                                </span>
                              )}
                              <Link
                                href={`/products/layout-compositions/${item.id}`}
                                className="min-w-0 flex-1 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-neutral-400"
                              >
                                <span className="block font-mono text-xs text-neutral-400">
                                  {item.id}
                                </span>
                                <span className="block truncate text-sm leading-5">
                                  {item.name}
                                </span>
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </LifelineNode>
              );
            })}
          </LifelineTimeline>
        </div>
      )}

      {!searching ? (
        <p className="shrink-0 pt-2 text-xs text-neutral-400">
          <span className="hidden [@media(hover:hover)_and_(min-width:768px)]:inline">
            滚轮、拖拽或方向键沿分类探索，悬停条目查看预览。
          </span>
          <span className="[@media(hover:hover)_and_(min-width:768px)]:hidden">
            左右滑动探索分类，点缩略图看大图。
          </span>
        </p>
      ) : null}
    </div>
  );
}
