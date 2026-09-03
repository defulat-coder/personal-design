'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/products';
import { Attribution } from '@/components/attribution';
import { LifelineNode, LifelineTimeline } from './lifeline/timeline';

function formatDay(date: string) {
  const [, month, day] = date.split('-');
  return `${Number(month)} 月 ${Number(day)} 日`;
}

/** 首页主视图：横向 lifeline 时间轴，节点 = 产品（按上线时间排序） */
export function HomeView({ products }: { products: Product[] }) {
  // 轨道可滚时才提示「探索」，否则文案不承诺不存在的交互
  const [scrollable, setScrollable] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-6 pt-10 sm:px-10">
        <p className="text-xs font-medium tracking-[0.3em] text-neutral-400 uppercase">
          Personal Design
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            产品集
          </h1>
          <p className="text-sm text-neutral-500">
            {scrollable ? (
              <>
                <span className="hidden [@media(hover:hover)_and_(min-width:768px)]:inline">
                  滚轮、拖拽或方向键，沿时间轴探索。
                </span>
                <span className="[@media(hover:hover)_and_(min-width:768px)]:hidden">
                  左右滑动，沿时间轴探索。
                </span>
              </>
            ) : (
              '点击节点，进入产品。'
            )}
          </p>
        </div>
      </header>

      <div className="mt-2 min-h-0 flex-1">
        <LifelineTimeline onScrollableChange={setScrollable}>
          {products.map((product, index) => (
            <LifelineNode
              key={product.slug}
              index={index}
              label={product.date.slice(0, 4)}
              sublabel={`No.${String(index + 1).padStart(2, '0')} · ${formatDay(product.date)}`}
              center
              className="max-w-[320px] sm:w-[420px]"
            >
              <Link
                href={product.href}
                className="group block rounded-xl transition active:scale-[0.98]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                  <Image
                    src={product.cover}
                    alt={product.name}
                    fill
                    sizes="(min-width: 640px) 420px, 80vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <ArrowUpRight className="size-4.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-900" />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {product.tagline}
                </p>
              </Link>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {product.description}
              </p>
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
            </LifelineNode>
          ))}

          {/* 关于节点：让首次访问者知道这是什么 */}
          <LifelineNode
            index={products.length}
            label="关于"
            sublabel="这个站点"
            center
          >
            <div className="border-l-2 border-neutral-900 pl-5">
              <p className="text-lg leading-8 font-medium text-neutral-800">
                这里收录我做的设计工具与参考产品。
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-500">
                每个产品都是一条独立的时间轴节点，从最早的出发，向右生长。右侧的虚线格是留给下一个的位置——这条线会一直延伸下去。
              </p>
            </div>
          </LifelineNode>

          {/* 占位节点：时间轴的「未来」一端 */}
          <LifelineNode
            index={products.length + 1}
            label="接下来"
            sublabel="持续增加中"
            center
          >
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-300">
              <span className="text-2xl">?</span>
              <span className="text-xs">下一个产品正在酝酿</span>
            </div>
          </LifelineNode>
        </LifelineTimeline>
      </div>

      <footer className="shrink-0 px-6 pb-4 sm:px-10">
        <Attribution />
      </footer>
    </div>
  );
}
