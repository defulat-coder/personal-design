import { catalog, categories, hasImage, thumbnailUrl } from '@personal-design/layout-compositions';
import { listPosts } from '@personal-design/inspora';
import { products } from '@/lib/products';
import { HomeView } from '@/components/home-view';

export default function HomePage() {
  const layoutPreviews = categories.slice(0, 3).flatMap(category => {
    const item = catalog.find(item => item.category_slug === category.slug && hasImage(item));
    return item ? [{ src: thumbnailUrl(item), alt: item.name }] : [];
  });
  const musePreviews = listPosts().flatMap(post => {
    const media = post.media[0];
    const src = media?.thumb ?? media?.poster;
    return src ? [{ src, alt: post.title }] : [];
  }).slice(0, 3);
  return <HomeView products={products} layoutPreviews={layoutPreviews} musePreviews={musePreviews} />;
}
