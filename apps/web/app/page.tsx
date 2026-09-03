import {
  catalog,
  hasImage,
  imageUrl,
  thumbnailUrl,
} from '@personal-design/layout-compositions';
import { products } from '@/lib/products';
import { CornerPeel } from '@/components/lifeline/corner-peel';
import { HomeView } from '@/components/home-view';
import { InspirationWall, type WallItem } from '@/components/inspiration-wall';

export default function HomePage() {
  // 灵感墙素材：均匀抽取 24 张有图的构图（构建期确定，SSG 友好）
  const pool = catalog.filter((item) => hasImage(item));
  const step = Math.max(1, Math.floor(pool.length / 24));
  const wallItems: WallItem[] = [];
  for (let i = 0; i < pool.length && wallItems.length < 24; i += step) {
    const item = pool[i];
    if (!item) continue;
    wallItems.push({
      id: item.id,
      name: item.name,
      thumb: thumbnailUrl(item),
      full: imageUrl(item),
    });
  }

  return (
    <div className="h-dvh">
      <CornerPeel
        front={<HomeView products={products} />}
        back={<InspirationWall items={wallItems} />}
      />
    </div>
  );
}
