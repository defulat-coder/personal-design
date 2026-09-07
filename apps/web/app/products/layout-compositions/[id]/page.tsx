import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { catalog, getLayoutById, hasImage, imageUrl, thumbnailUrl, type LayoutItem } from '@personal-design/layout-compositions';
import { DetailMainImage } from '@/components/detail-tools';
import { BrowseNavigation } from '@/components/browse-navigation';
import { buttonClassName } from '@/components/button';
import type { LightboxItem } from '@/components/lifeline/lightbox';
import styles from './page.module.css';

export const dynamicParams = false;
export function generateStaticParams() { return catalog.map(item => ({ id:item.id })); }
interface PageProps { params:Promise<{ id:string }> }
export async function generateMetadata({ params }:PageProps):Promise<Metadata> {
  const { id } = await params;
  const item = getLayoutById(id);
  if (!item) return {};
  return { title:`${item.id} ${item.name} · 布局参考`, description:`${item.name} —— ${item.category} / ${item.subcategory}，排版构图图鉴。` };
}
const detailHref = (item:LayoutItem) => `/products/layout-compositions/${item.id}`;
export default async function LayoutDetailPage({ params }:PageProps) {
  const { id } = await params;
  const item = getLayoutById(id);
  if (!item) notFound();
  const group = catalog.filter(entry => entry.subcategory_slug === item.subcategory_slug);
  const src = hasImage(item) ? imageUrl(item) : null;
  const categoryHref = `/products/layout-compositions?cat=${encodeURIComponent(item.category)}`;
  const themeHref = `${categoryHref}&theme=${encodeURIComponent(item.subcategory_slug)}`;
  const withImage = group.filter(hasImage);
  const siblings:LightboxItem[] = withImage.map(entry => ({ src:imageUrl(entry), thumb:thumbnailUrl(entry), alt:entry.name, serial:entry.id, href:detailHref(entry) }));
  const related = group.filter(entry => entry.id !== item.id).slice(0,6);
  return <main className={styles.page}>
    <BrowseNavigation listPath="/products/layout-compositions" storageKey="layouts-browse" returnLabel="返回布局参考" fallbackHref={themeHref}
      currentHref={detailHref(item)} entries={group.map(entry => ({ href:detailHref(entry), title:entry.name }))} />
    <header className={styles.heading}>
      <h1>{item.name}</h1>
      <div className={styles.metadata}><span className={styles.serial}>图鉴 {item.id}</span><Link href={categoryHref}>{item.category}</Link><Link href={themeHref}>{item.subcategory}</Link></div>
    </header>
    {src ? <section className={styles.artwork} aria-label="图鉴图片">
      <div className={styles.media}><DetailMainImage key={item.id} src={src} thumb={thumbnailUrl(item)} alt={item.name} serial={item.id} siblings={siblings} index={withImage.findIndex(entry => entry.id === item.id)} /></div>
    </section> : <section className={styles.missing} aria-label="图片状态"><h2>这张图鉴暂缺图片</h2><p>“{item.name}”的名称与分类仍保留在图鉴中。你可以继续查阅同主题的其他参考。</p><Link href={themeHref} className={buttonClassName()}>浏览这个主题</Link></section>}
    <section className={styles.related}>
      <div className={styles.sectionHeading}><div><h2>{item.subcategory}</h2><p>继续浏览同主题图鉴</p></div><Link href={themeHref} className={buttonClassName({variant:'ghost'})}>查看主题全部<ArrowRight aria-hidden size={16} /></Link></div>
      <div className={styles.relatedGrid}>{related.map(entry => <Link key={entry.id} href={detailHref(entry)} className={styles.relatedCard}>
        <span className={styles.relatedMedia}>{hasImage(entry) ? <Image src={thumbnailUrl(entry)} alt="" fill sizes="(min-width: 1024px) 180px, 45vw" className="object-contain" /> : <span className={styles.missingThumb}>图片暂缺</span>}</span>
        <span className={styles.relatedName}><span className={styles.serial}>{entry.id}</span>{entry.name}</span>
      </Link>)}</div>
    </section>
  </main>;
}
