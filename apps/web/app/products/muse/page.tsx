import type { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './page.module.css';
import { PageHeading } from '@/components/page-heading';
import { listCategories, listPosts } from '@personal-design/inspora';
import { PlateWall, type PlateWallItem } from '@/components/plate-wall';

export const metadata: Metadata = {
  title: '灵感集 · 设计灵感同步库',
  description:
    '持续整理的设计灵感集，直接浏览图片与视频，每条都可查看完整的原始信息与作者出处。',
};

const posts = listPosts();

// 只把客户端需要的字段传下去，控制 RSC 负载
const items: PlateWallItem[] = posts.flatMap((post) => {
  const first = post.media[0];
  const src = first?.type === 'video' ? first.src : (first?.thumb ?? first?.src);
  return [
    {
      key: post.slug,
      category: post.category ?? '未分类',
      lead: post.creatorName ?? undefined,
      name: post.title,
      sub: post.createdAt.slice(0, 10),
      href: `/products/muse/${post.slug}`,
      kind: first?.type ?? 'image',
      src: src ?? '',
      poster: first?.poster ?? first?.thumb,
      fullSrc:
        first?.type === 'image' ? (first.src ?? first.thumb ?? undefined) : undefined,
      width: first?.width ?? 4,
      height: first?.height ?? 3,
      mediaCount: post.media.length,
      // 搜索命中面：分类 + 行业 + 风格标签（标题短词多，只搜标题会显得「搜不到」）
      keywords: [post.category, ...post.industries, ...post.styles]
        .filter(Boolean)
        .join(' '),
    },
  ];
});

const tabs = listCategories().map((category) => ({ ...category, count: items.filter((item) => item.category === category.name).length })).filter((category) => category.count > 0);
const uncategorized = items.filter((item) => item.category === '未分类').length;
if (uncategorized && !tabs.some((category) => category.name === '未分类')) tabs.push({ name: '未分类', count: uncategorized });


export default function MusePage() {
  return (
    <main className={styles.page}>
      <PageHeading title="灵感集" description="图像、界面与动效。找到值得收藏的设计，也找到它的创作者。" />

      <div>
        {/* PlateWall 内用 useSearchParams 恢复分类现场，需要 Suspense 边界 */}
        <Suspense fallback={<p role="status" className="py-8 text-ink-soft">正在准备灵感列表…</p>}>
          <PlateWall
            categories={tabs}
            items={items}
            batchSize={24}
            searchPlaceholder="搜索灵感"
          />
        </Suspense>
      </div>
    </main>
  );
}
