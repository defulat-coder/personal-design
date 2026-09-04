import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  FileJson,
} from 'lucide-react';
import {
  getAdjacentPosts,
  getPostBySlug,
  listPosts,
} from '@personal-design/inspora';
import { DetailKeyboardNav } from '@/components/detail-tools';
import { MuseMediaCarousel } from '@/components/inspora-media-carousel';

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

/** 标签行：左 label 右 chips（Industries / Colors / Styles） */
function MetaRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="flex items-center justify-between gap-4 text-[12.5px]">
      <span className="shrink-0 text-ink">{label}</span>
      <span className="flex flex-wrap justify-end gap-1.5">
        {values.map((value) => (
          <span
            key={value}
            className="border border-hairline px-2 py-1 font-mono text-[11.5px] text-ink-soft"
          >
            {value}
          </span>
        ))}
      </span>
    </div>
  );
}

const navButtonClass =
  'flex size-8 items-center justify-center border border-hairline text-ink-soft transition-colors hover:border-ink hover:text-ink';
const navButtonDisabledClass =
  'flex size-8 items-center justify-center border border-hairline text-hairline-strong';

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
  const metaLine = [
    dateFmt.format(new Date(post.publishedAt ?? post.createdAt)),
    post.media.length > 0 ? `${post.media.length} 个媒体` : null,
    first?.width && first?.height ? `${first.width} × ${first.height}` : null,
    formatBytes(first?.sizeBytes ?? null),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="flex min-h-dvh flex-col lg:h-dvh">
      <nav className="flex shrink-0 items-center gap-1 px-6 pt-5 text-[11.5px] text-ink-faint sm:px-10">
        <Link href="/" className="hover:text-ink">
          产品集
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={listHref} className="flex items-center gap-1.5 hover:text-ink">
          <span className="bg-line-muse px-1.5 py-px font-mono text-[10.5px] font-medium text-white dark:text-paper">
            M·01
          </span>
          灵感集
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-ink">{post.title}</span>
      </nav>
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      {/* 媒体区：图版框内横向 snap 轮播，媒体 contain 居中 */}
      <div className="relative flex-1 bg-paper p-4 sm:p-6 lg:min-h-0">
        {media.length > 0 ? (
          <div className="h-full border border-hairline bg-plate p-1.5">
            <MuseMediaCarousel media={media} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[12.5px] text-ink-faint">
            媒体缺失
          </div>
        )}
      </div>

      {/* 侧栏：固定宽度、1px 分隔线、直角 */}
      <aside className="flex w-full flex-col border-t border-hairline bg-plate lg:h-full lg:w-[clamp(360px,30vw,510px)] lg:shrink-0 lg:border-t-0 lg:border-l">
        {/* 信息牌的线路归属带：只做这一条 */}
        <div aria-hidden className="h-[3px] shrink-0 bg-line-muse" />

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6 sm:px-8">
          {post.category ? (
            <p>
              <Link
                href={listHref}
                className="inline-block border border-hairline px-2 py-1 font-mono text-[11.5px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {post.category}
              </Link>
            </p>
          ) : null}

          <div>
            <h1 className="font-display text-[26px] leading-[1.05] font-semibold text-balance">
              {post.title}
            </h1>
            {post.creatorName ? (
              <p className="mt-2 flex items-center gap-2">
                {post.creatorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 小头像无需优化管线
                  <img
                    src={post.creatorAvatar}
                    alt=""
                    className="size-5 rounded-full border border-hairline object-cover"
                  />
                ) : null}
                {post.creatorUrl ? (
                  <a
                    href={post.creatorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12.5px] text-ink underline-offset-2 hover:underline"
                  >
                    {post.creatorName}
                  </a>
                ) : (
                  <span className="text-[12.5px] text-ink">{post.creatorName}</span>
                )}
              </p>
            ) : null}
          </div>

          {post.description && post.description !== post.title ? (
            <p className="text-[12.5px] leading-[1.5] text-ink-soft">{post.description}</p>
          ) : null}

          <p className="font-mono text-[11.5px] text-ink-faint">{metaLine}</p>

          <div className="flex flex-col gap-3">
            <MetaRow label="Industries" values={post.industries} />
            <MetaRow label="Colors" values={post.colors} />
            <MetaRow label="Styles" values={post.styles} />
          </div>

          {/* 原始出处主按钮 + 同步的原始 JSON */}
          {post.sourceUrl ? (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-ink py-3 text-[12.5px] text-plate transition-colors hover:bg-ink/85"
            >
              <span aria-hidden className="size-3 shrink-0 bg-line-muse" />
              查看原始出处
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}

          {post.raw ? (
            <div className="flex justify-end text-[11.5px] text-ink-soft">
              <details className="group relative">
                <summary className="inline-flex cursor-pointer items-center gap-1 underline-offset-2 select-none hover:text-ink hover:underline">
                  <FileJson className="size-3.5" />
                  同步的原始 JSON
                </summary>
                <pre className="absolute right-0 z-10 mt-2 max-h-96 w-[min(28rem,80vw)] overflow-auto border border-hairline bg-plate p-3 font-mono text-[11.5px] leading-[1.4] text-ink-soft">
                  {JSON.stringify(post.raw, null, 2)}
                </pre>
              </details>
            </div>
          ) : null}
        </div>

        {/* 上下件导航：钉在信息牌底缘（站牌 footer），填补短内容条目的侧栏空档 */}
        <div className="flex items-center justify-end border-t border-hairline px-4 py-4">
          <div className="flex gap-1.5">
            {prev ? (
              <Link
                href={`/products/muse/${prev.slug}`}
                aria-label={`上一件：${prev.title}`}
                className={navButtonClass}
              >
                <ArrowLeft className="size-4" />
              </Link>
            ) : (
              <span className={navButtonDisabledClass}>
                <ArrowLeft className="size-4" />
              </span>
            )}
            {next ? (
              <Link
                href={`/products/muse/${next.slug}`}
                aria-label={`下一件：${next.title}`}
                className={navButtonClass}
              >
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className={navButtonDisabledClass}>
                <ArrowRight className="size-4" />
              </span>
            )}
          </div>
        </div>
      </aside>
      </div>

      <DetailKeyboardNav
        prevHref={prev ? `/products/muse/${prev.slug}` : undefined}
        nextHref={next ? `/products/muse/${next.slug}` : undefined}
        hrefPattern="^/products/muse/"
      />
    </main>
  );
}
