import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAdjacentPosts,
  getPostBySlug,
  listPosts,
} from '@personal-design/inspora';
import { DetailKeyboardNav } from '@/components/detail-tools';
import { MuseMediaCarousel } from '@/components/inspora-media-carousel';
import { Button, buttonClassName } from '@/components/button';
import { MuseReturnLink } from '../return-link';
import styles from './page.module.css';
import { RawJsonDetails } from '@/components/raw-json-details';

export const dynamicParams = false;

export function generateStaticParams() {
  return listPosts().map((post) => ({ slug: post.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} · 灵感集`,
    description:
      post.description ??
      `${post.title} —— ${post.category ?? '设计灵感'}，${post.creatorName ?? ''}。`,
  };
}

const dateFmt = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' });

function formatBytes(bytes: number | null): string | null {
  if (!bytes) return null;
  // 数值与单位间用不换行空格：窄侧栏里「206 KB」不从中间折断
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MetaRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return <div className={styles.row}><span>{label}</span><div className={styles.chips}>{values.map((value, index) => <span key={`${value}-${index}`} className={styles.chip}>{value}</span>)}</div></div>;
}

export default async function MuseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(post);

  const media = post.media
    .filter((m) => m.src)
    .map((m, i) => ({
      id: m.id,
      type: m.type,
      src: m.src ?? '',
      poster: m.poster ?? m.thumb,
      width: m.width,
      height: m.height,
      alt: m.alt ?? `${post.title} (${i + 1})`,
    }));

  const listHref = post.category
    ? `/products/muse?cat=${encodeURIComponent(post.category)}`
    : '/products/muse';

  const first = post.media[0];
  const date = new Date(post.publishedAt ?? post.createdAt);
  const metaLine = [
    Number.isNaN(date.getTime()) ? '日期未提供' : dateFmt.format(date),
    post.media.length > 0 ? `${post.media.length} 个媒体` : null,
    first?.width && first?.height ? `${first.width} × ${first.height}` : null,
    formatBytes(first?.sizeBytes ?? null),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className={styles.page}>
      <nav className={styles.navigation} aria-label="灵感导航">
        <MuseReturnLink fallback={listHref} />
        <div className={styles.adjacent}>
          {prev ? <Link href={`/products/muse/${prev.slug}`} aria-label={`上一件：${prev.title}`} className={buttonClassName({variant:'ghost'})}><ArrowLeft size={16} /><span>上一件</span></Link> : <Button variant="ghost" disabled aria-label="已是第一件"><ArrowLeft size={16} /><span>上一件</span></Button>}
          {next ? <Link href={`/products/muse/${next.slug}`} aria-label={`下一件：${next.title}`} className={buttonClassName({variant:'ghost'})}><span>下一件</span><ArrowRight size={16} /></Link> : <Button variant="ghost" disabled aria-label="已是最后一件"><span>下一件</span><ArrowRight size={16} /></Button>}
        </div>
      </nav>
      <header className={styles.heading}>
        <h1 className={styles.title}>{post.title || '未命名灵感'}</h1>
        <div className={styles.byline}>
          {post.creatorName ? <p className={styles.author}>
            {post.creatorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- Local author thumbnail.
              <img src={post.creatorAvatar} alt="" />
            ) : null}
            {post.creatorUrl ? <a href={post.creatorUrl} target="_blank" rel="noreferrer">{post.creatorName}</a> : <span>{post.creatorName}</span>}
          </p> : <p>作者信息未提供</p>}
          {post.category ? <Link href={listHref} className={styles.category}>{post.category}</Link> : <span>未分类</span>}
        </div>
      </header>
      {media.length ? <MuseMediaCarousel key={post.slug} media={media} /> : <div className={styles.empty}><p>这件灵感尚无可用媒体</p><p>仍可阅读作品信息与原始出处。</p></div>}
      <div className={styles.information}>
        <section aria-label="作品信息" className={styles.about}>
          <h2>关于作品</h2>
          {post.description && post.description !== post.title ? <p className={styles.description}>{post.description}</p> : null}
          <p className={styles.meta}>{metaLine}</p>
          {post.industries.length || post.colors.length || post.styles.length ? <div className={styles.rows}><MetaRow label="行业" values={post.industries} /><MetaRow label="颜色" values={post.colors} /><MetaRow label="风格" values={post.styles} /></div> : null}
        </section>
        <section className={styles.provenance} aria-label="原始信息">
          <h2>原始信息</h2>
          {post.sourceUrl ? <a href={post.sourceUrl} target="_blank" rel="noreferrer" className={buttonClassName({ variant:'primary' })}>查看原始出处<ArrowUpRight size={16} /></a> : <p className={styles.description}>这条内容未提供原始出处链接。</p>}
          {post.raw ? <RawJsonDetails><pre tabIndex={0} data-detail-keys-ignore className={styles.raw}>{JSON.stringify(post.raw, null, 2)}</pre></RawJsonDetails> : <p className={styles.meta}>暂无原始 JSON</p>}
        </section>
      </div>
      <DetailKeyboardNav prevHref={prev ? `/products/muse/${prev.slug}` : undefined} nextHref={next ? `/products/muse/${next.slug}` : undefined} hrefPattern="^/products/muse/" />
    </main>
  );
}
