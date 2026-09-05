'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { PageHeading } from './page-heading';
import fields from './field.module.css';
import { Button } from './button';
import { CategoryTabs } from './category-tabs';
import styles from './layout-wall.module.css';

export interface LayoutWallItem { id: string; name: string; category: string; theme: string; themeSlug: string; thumb: string | null }
interface LayoutWallProps { categories: { name: string; count: number }[]; items: LayoutWallItem[]; themeCount: number }
const listPath = '/products/layout-compositions';
export function LayoutWall({ categories, items }: LayoutWallProps) {
  const params = useSearchParams();
  const router = useRouter();
  const active = params.get('cat') || '全部';
  const theme = params.get('theme') || '';
  const query = params.get('q') || '';
  const normalized = query.trim().toLocaleLowerCase();
  const categoryItems = active === '全部' ? items : items.filter((item) => item.category === active);
  const themes = [...new Map(categoryItems.map((item) => [item.themeSlug, item.theme])).entries()];
  const filtered = categoryItems.filter((item) => (!theme || item.themeSlug === theme) && (!normalized || `${item.id} ${item.name} ${item.category} ${item.theme}`.toLocaleLowerCase().includes(normalized)));
  const hasFilters = active !== '全部' || !!theme || !!query;
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) { if (value) next.set(key, value); else next.delete(key); }
    router.replace(`${listPath}${next.size ? `?${next}` : ''}`, { scroll: false });
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
    <PageHeading title="布局参考" description="从构图原则到版式细节，按分类、主题或名称找到合适的参考。" />
    <section className={styles.content} aria-label="图鉴检索与结果">
      <CategoryTabs categories={categories} total={items.length} active={active} onSelect={(name) => update({ cat: name === '全部' ? '' : name, theme: '' })} line="layouts" />
      <div className={styles.filters}>
        <form className={`${styles.search} ${fields.field}`} role="search" onSubmit={(event) => { event.preventDefault(); update({ q: String(new FormData(event.currentTarget).get('q') || '').trim() }); }}>
          <label htmlFor="layout-search" className={styles.srOnly}>搜索图鉴</label>
          <Search aria-hidden size={18} />
          <input key={query} id="layout-search" name="q" type="search" defaultValue={query} placeholder="搜索名称、编号或关键词" />
          <Button type="submit" variant="ghost">搜索</Button>
        </form>
        <div className={styles.theme}><label htmlFor="layout-theme">主题</label><select className={fields.field} id="layout-theme" value={theme} onChange={(event) => update({ theme: event.target.value })}>
          <option value="">全部主题</option>
          {theme && !themes.some(([slug]) => slug === theme) && <option value={theme}>未知主题：{theme}</option>}
          {themes.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
        </select></div>
      </div>
      <div className={styles.results}><p role="status">{filtered.length} 条图鉴{query && <> · 搜索“{query}”</>}{filtered.some((item) => !item.thumb) && <span> · 含暂缺图片的条目</span>}</p>{hasFilters && <Button variant="ghost" onClick={() => router.replace(listPath, { scroll: false })}>清除筛选</Button>}</div>
      {filtered.length ? <div className={styles.grid}>
        {filtered.map((item) => <Link key={item.id} id={`layout-${item.id}`} href={`${listPath}/${item.id}`} className={styles.card} aria-label={`${item.id} ${item.name}${!item.thumb ? '，暂缺图片' : ''}`} onClick={() => { try { sessionStorage.setItem('layouts-browse', JSON.stringify({ url: location.pathname + location.search, y: window.scrollY, id: item.id })); } catch { /* Optional return memory. */ } }}>
          <span className={styles.media}>{item.thumb ? <Image src={item.thumb} alt="" fill sizes="(min-width: 1200px) 220px, (min-width: 760px) 23vw, 45vw" className="object-contain" /> : <span className={styles.missing}><span>图片暂缺</span><span>名称与主题仍可查阅</span></span>}</span>
          <span className={styles.caption}><span className={styles.serial}>{item.id}</span><strong>{item.name}</strong></span>
          <span className={styles.themeCaption}>{item.theme}</span>
        </Link>)}
      </div> : <div className={styles.empty}><h2>没有找到匹配的图鉴</h2><p>试试其他关键词，或清除分类与主题筛选。</p><Button onClick={() => router.replace(listPath, { scroll: false })}>查看全部图鉴</Button></div>}
    </section>
  </div>;
}
