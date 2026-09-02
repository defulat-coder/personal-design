import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { products } from '@/lib/products';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <header>
        <p className="text-xs font-medium tracking-[0.3em] text-neutral-400 uppercase">
          Personal Design
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          产品集
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-neutral-500">
          这里收录我做的一系列设计工具与参考产品，持续增加中。
        </p>
      </header>

      <section className="mt-14 grid gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={product.href}
            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg hover:shadow-neutral-200/60"
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
              <Image
                src={product.cover}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <ArrowUpRight className="size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-900" />
              </div>
              <p className="mt-1 text-sm text-neutral-500">{product.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.stats.map((stat) => (
                  <span
                    key={stat}
                    className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-500"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
