import { products } from '@/lib/products';
import { HomeView } from '@/components/home-view';

export default function HomePage() {
  return (
    <div className="h-dvh">
      <HomeView products={products} />
    </div>
  );
}
