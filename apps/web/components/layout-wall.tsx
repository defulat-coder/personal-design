'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, type PointerEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { categoryLabel } from '@/lib/category-label';
import { PageHeading } from './page-heading';
import { CollectionSearch } from './collection-search';
import { Button } from './button';
import { CategoryTabs } from './category-tabs';
import styles from './layout-wall.module.css';

export interface LayoutWallItem { id: string; name: string; category: string; theme: string; themeSlug: string; thumb: string | null }
interface LayoutWallProps { categories: { name: string; count: number }[]; items: LayoutWallItem[] }
const listPath = '/products/layout-compositions';
export function LayoutWall({ categories, items }: LayoutWallProps) {
  const params = useSearchParams();
  const router = useRouter();
  const active = params.get('cat') || '全部';
  const theme = params.get('theme') || '';
  const query = params.get('q') || '';
  const normalized = query.trim().toLocaleLowerCase();
  const categoryItems = active === '全部' ? items : items.filter((item) => item.category === active);
  const themeName = theme ? items.find(item => item.themeSlug === theme)?.theme : null;
  const filtered = categoryItems.filter((item) => (!theme || item.themeSlug === theme) && (!normalized || `${item.id} ${item.name} ${item.category} ${categoryLabel(item.category)} ${item.theme}`.toLocaleLowerCase().includes(normalized)));
  const hasFilters = active !== '全部' || !!theme || !!query;
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) { if (value) next.set(key, value); else next.delete(key); }
    window.history.replaceState(null, '', `${listPath}${next.size ? `?${next}` : ''}`);
  }
  useEffect(() => {
    let frame = 0;
    try {
      const raw = sessionStorage.getItem('layouts-browse');
      if (!raw) return;
      const saved = JSON.parse(raw) as { url: string; y: number; id: string };
      if (saved.url !== location.pathname + location.search) return;
      frame = requestAnimationFrame(() => {
        document.getElementById(`layout-${saved.id}`)?.focus({ preventScroll: true });
        window.scrollTo({ top: saved.y, behavior: 'instant' });
      });
    } catch { /* Browsing works without storage. */ }
    return () => cancelAnimationFrame(frame);
  }, []);
  return <div className={styles.wall}>
    <PageHeading title="布局参考" actions={
      <CollectionSearch value={query} onChange={value => update({ q:value })} placeholder="搜索图鉴" label="搜索图鉴" />
    } />
    <section className={styles.content} aria-label="图鉴检索与结果">
      <CategoryTabs categories={categories} active={active} onSelect={(name) => update({ cat: name === '全部' ? '' : name, theme: '' })} />
      <div className={hasFilters ? styles.results : styles.srOnly}><p role="status">{theme ? `${themeName ?? '主题筛选'} · ` : ''}{filtered.length} 条图鉴</p>{hasFilters && <Button variant="ghost" onClick={() => router.replace(listPath, { scroll: false })}>清除筛选</Button>}</div>
      {filtered.length ? <div className={styles.grid}>
        {filtered.map((item) => <Link key={item.id} id={`layout-${item.id}`} href={`${listPath}/${item.id}?browse=1`} className={styles.card} aria-label={`${item.id} ${item.name}${!item.thumb ? '，暂缺图片' : ''}`} onClick={() => { try { sessionStorage.setItem('layouts-browse', JSON.stringify({ url: location.pathname + location.search, y: window.scrollY, id: item.id, entries: filtered.map(entry => ({ href: `${listPath}/${entry.id}`, title: entry.name })) })); } catch { /* Optional return memory. */ } }}>
          <LayoutPreview thumb={item.thumb} />
          <span className={styles.caption}><strong>{item.name}</strong><ArrowUpRight size={18} aria-hidden /></span>
        </Link>)}
      </div> : <div className={styles.empty}><h2>没有找到匹配的图鉴</h2><p>试试其他关键词，或清除筛选。</p><Button onClick={() => router.replace(listPath, { scroll: false })}>查看全部图鉴</Button></div>}
    </section>
  </div>;
}

/** Keep the link and grid still; only the image inside its frame follows the pointer. */
function LayoutPreview({ thumb }: { thumb:string | null }) {
  const frame = useRef<HTMLSpanElement>(null);
  const delay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const paint = useRef(0);
  const pointer = useRef({ x:0, y:0 });
  const stop = () => {
    clearTimeout(delay.current);
    delay.current = undefined;
    cancelAnimationFrame(paint.current);
    paint.current = 0;
    if (frame.current) delete frame.current.dataset.zoom;
  };
  useEffect(() => () => { clearTimeout(delay.current); cancelAnimationFrame(paint.current); }, []);
  const follow = (event:PointerEvent<HTMLSpanElement>) => {
    pointer.current = { x:event.clientX, y:event.clientY };
    if (paint.current) return;
    paint.current = requestAnimationFrame(() => {
      paint.current = 0;
      const element = frame.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0,Math.min(100,(pointer.current.x - rect.left) / rect.width * 100));
      const y = Math.max(0,Math.min(100,(pointer.current.y - rect.top) / rect.height * 100));
      element.style.setProperty('--zoom-origin', `${x}% ${y}%`);
    });
  };
  return <span ref={frame} className={styles.media}
    onPointerEnter={event => {
      if (!thumb || event.pointerType !== 'mouse' || !matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      follow(event);
      clearTimeout(delay.current);
      delay.current = setTimeout(() => { if (frame.current) frame.current.dataset.zoom = 'true'; }, 180);
    }}
    onPointerMove={event => { if (event.pointerType === 'mouse' && (delay.current || frame.current?.dataset.zoom)) follow(event); }}
    onPointerLeave={stop} onPointerCancel={stop}>
    {thumb ? <Image src={thumb} alt="" fill unoptimized className={styles.poster} /> : <span className={styles.missing}><span>图片暂缺</span></span>}
  </span>;
}
