import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { listCategories, listPosts } from '@personal-design/inspora';
import { PlateWall, type PlateWallItem } from '@/components/plate-wall';

export const metadata: Metadata = {
  title: '灵感集 · 设计灵感同步库',
  description:
    '持续同步的设计灵感集，图片与视频全部本地化存储，图版拼幅直接浏览，每条都可查看完整的原始信息与作者出处。',
};

const posts = listPosts();

// 只把客户端需要的字段传下去，控制 RSC 负载
const items: PlateWallItem[] = posts.flatMap((post) => {
  const first = post.media[0];
  if (!first) return [];
  const src = first.type === 'video' ? first.src : first.thumb;
  if (!src || !first.width || !first.height) return [];
  return [
    {
      key: post.slug,
      category: post.category ?? '未分类',
      lead: post.creatorName ?? undefined,
      name: post.title,
      sub: post.createdAt.slice(0, 10),
      href: `/products/muse/${post.slug}`,
      kind: first.type,
      src,
      poster: first.poster ?? first.thumb,
      fullSrc:
        first.type === 'image' ? (first.src ?? first.thumb ?? undefined) : undefined,
      width: first.width,
      height: first.height,
      mediaCount: post.media.length,
    },
  ];
});

const tabs = listCategories().filter((c) =>
  items.some((item) => item.category === c.name),
);

const latestDate = posts.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt.slice(0, 10);

export default function MusePage() {
  return (
    <main className="mx-auto w-full max-w-[2400px] px-6 pb-10 sm:px-10">
      {/* 站牌式刊头：返回链接 + 线路编号牌 + 大字站名，底缘 3px 线路色带 */}
      <header className="pt-6">
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
              <span className="bg-line-muse px-1.5 py-px font-mono text-[10.5px] font-medium text-white dark:text-paper">
                M·01
              </span>
              <h1 className="font-display text-[30px] leading-none font-semibold">
                灵感集
              </h1>
            </div>
          </div>
          <p className="font-mono text-[11.5px] text-ink-soft">
            收录 {items.length} 件 · 持续同步 ·{' '}
            <span className="whitespace-nowrap">最近收录 {latestDate}</span>
          </p>
        </div>
        <div aria-hidden className="h-[3px] bg-line-muse" />
      </header>

      <div className="mt-4">
        {/* PlateWall 内用 useSearchParams 恢复分类现场，需要 Suspense 边界 */}
        <Suspense fallback={null}>
          <PlateWall categories={tabs} items={items} batchSize={24} />
        </Suspense>
      </div>
    </main>
  );
}
