'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import fields from './field.module.css';
import { Button } from './button';
import styles from './plate-wall.module.css';
import { CategoryTabs, useCatParam } from './category-tabs';

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

/** Stable gallery: one native link per work, static previews, explicit batching. */
export function PlateWall({ categories, items, searchPlaceholder, batchSize = DEFAULT_BATCH }: PlateWallProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [active, select] = useCatParam(categories.map((category) => category.name));
  const query = searchParams.get('q') ?? '';
  const setQuery = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set('q', value); else params.delete('q');
    window.history.replaceState(null, '', `${pathname}${params.size ? `?${params}` : ''}`);
  };
  const returnHref = `${pathname}${searchParams.size ? `?${searchParams}` : ''}`;
  const remember = (key: string) => {
    try { sessionStorage.setItem('muse-return', JSON.stringify({ href: returnHref, shown, y: window.scrollY, key })); } catch {}
  };
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

  // URL is the query source of truth, including browser back/forward.
  useEffect(() => {
    let frame = 0;
    try {
      const saved = JSON.parse(sessionStorage.getItem('muse-return') ?? 'null');
      if (saved?.href === window.location.pathname + window.location.search) {
        frame = requestAnimationFrame(() => {
          setShown(Math.max(batchSize, Number(saved.shown) || batchSize));
          frame = requestAnimationFrame(() => {
            window.scrollTo(0, Number(saved.y) || 0);
            if (typeof saved.key === 'string') document.getElementById(`muse-${saved.key}`)?.focus({ preventScroll: true });
          });
        });
      }
    } catch {}
    return () => cancelAnimationFrame(frame);
  }, [batchSize]);

  const clear = () => window.history.replaceState(null, '', pathname);
  return (
    <section aria-label="灵感浏览">
      <div className={styles.toolbar}>
        {searchPlaceholder ? <label className={`${styles.search} ${fields.field}`}>
          <Search aria-hidden />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} aria-label="搜索标题、作者或标签" />
        </label> : null}
      </div>
      <CategoryTabs categories={categories} total={items.length} active={active} onSelect={select} line="muse" />
      <div className={styles.results}>
        <p role="status">{active === '全部' ? '全部灵感' : active} · {filtered.length} 件{query ? ` · 搜索「${query}」` : ''}</p>
        {query || active !== '全部' ? <Button variant="ghost" onClick={clear}>清除筛选</Button> : null}
      </div>
      {filtered.length === 0 ? <div className={styles.empty}>
        <h2>{items.length ? '没有找到匹配的灵感' : '还没有收录内容'}</h2>
        <p>{items.length ? '试试其他关键词，或清除分类与搜索条件。' : '内容收录后会出现在这里。'}</p>
        {items.length ? <Button onClick={clear}>查看全部灵感</Button> : null}
      </div> : <div className={styles.grid}>
        {visible.map((item) => <PlateCell key={item.key} item={item} onNavigate={remember} />)}
      </div>}
      {visible.length < filtered.length ? <div className={styles.more}>
        <span>已显示 {visible.length} / {filtered.length}</span>
        <Button onClick={() => setShown((n) => Math.min(n + batchSize, filtered.length))}>加载更多灵感</Button>
      </div> : filtered.length > 0 ? <p className={styles.more}>已展示全部 {filtered.length} 件灵感</p> : null}
    </section>
  );
}

function PlateCell({ item, onNavigate }: { item: PlateWallItem; onNavigate: (key: string) => void }) {
  const preview = item.kind === 'video' ? item.poster : item.src;
  const [failed, setFailed] = useState(!preview);
  const [ready, setReady] = useState(false);
  const cellRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const cell = cellRef.current;
    if (!cell || ready || failed) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !timer) timer = setTimeout(() => setFailed(true), 15000);
      else if (!entry?.isIntersecting && timer) { clearTimeout(timer); timer = undefined; }
    });
    observer.observe(cell);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [ready, failed]);
  return <Link ref={cellRef} id={`muse-${item.key}`} href={item.href} className={styles.cell} onClick={() => onNavigate(item.key)}>
    <figure>
      <div className={styles.media}>
        {preview ? <Image src={preview} alt="" fill sizes="(min-width: 1200px) 25vw, (min-width: 760px) 33vw, (min-width: 360px) 50vw, 100vw" onLoad={() => { setReady(true); setFailed(false); }} onError={() => setFailed(true)} /> : null}
        {failed ? <span className={styles.failure}>预览暂不可用<span>查看作品与出处</span></span> : null}
        {item.kind === 'video' || (item.mediaCount ?? 0) > 1 ? <span className={styles.badge}>{item.kind === 'video' ? '视频' : `${item.mediaCount} 张图片`}</span> : null}
      </div>
      <figcaption className={styles.caption}>
        <h2 className={styles.title}>{item.name || '未命名灵感'}</h2>
        <span className={styles.meta}>{item.lead ?? '作者未提供'}<span>{item.category}</span></span>
      </figcaption>
    </figure>
  </Link>;
}
