'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { upstream } from '@personal-design/layout-compositions/upstream';
import type { LineId, Product } from '@/lib/products';
import { LifelineNode, LifelineTimeline } from './lifeline/timeline';

/** 线路编号牌的字母代码（M = muse 朱红线，L = layouts 蓝线） */
const LINE_CODE: Record<LineId, string> = { muse: 'M', layouts: 'L' };

/** 线路色 utility（完整类名，供 Tailwind 扫描；勿模板拼接） */
const LINE_CLASSES: Record<LineId, { badge: string; ring: string }> = {
  muse: {
    badge: 'bg-line-muse',
    ring: 'border-ink group-hover:border-line-muse',
  },
  layouts: {
    badge: 'bg-line-layouts',
    ring: 'border-ink group-hover:border-line-layouts',
  },
};

function formatDay(date: string) {
  const [, month, day] = date.split('-');
  return `${Number(month)} 月 ${Number(day)} 日`;
}

/** 线路编号牌：直角色底小方块 + mono 字（深色下色更亮，字翻成纸色保对比度） */
function LineBadge({ line, no }: { line: LineId; no: string }) {
  return (
    <span
      className={`${LINE_CLASSES[line].badge} px-1.5 py-px font-mono text-[10.5px] font-medium text-white dark:text-paper`}
    >
      {LINE_CODE[line]}·{no}
    </span>
  );
}

/** 首页主视图：地铁线路图上的产品站（横向 lifeline 时间轴，按上线时间排序） */
export function HomeView({ products }: { products: Product[] }) {
  const latest = products.reduce((a, b) => (a.date > b.date ? a : b)).date;
  // 每条线路内的站序（M·01 / L·01…）
  const lineCounts = new Map<LineId, number>();
  const lineNo = (line: LineId) => {
    const next = (lineCounts.get(line) ?? 0) + 1;
    lineCounts.set(line, next);
    return String(next).padStart(2, '0');
  };

  return (
    <div className="flex h-full flex-col">
      {/* 站牌式刊头：左大字 + 右 mono 数据行，底缘 3px ink 线路带 */}
      <header className="shrink-0 px-6 pt-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-4">
          <h1 className="font-display text-[30px] leading-none font-semibold">
            <span className="font-medium">产品集</span>{' '}
            <span className="uppercase">Personal Design</span>
          </h1>
          <p className="pr-6 font-mono text-[11.5px] text-ink-soft">
            在营 {String(products.length).padStart(2, '0')} · 规划 01 ·{' '}
            <span className="whitespace-nowrap">最近上线 {latest}</span>
          </p>
        </div>
        <div aria-hidden className="h-[3px] bg-ink" />
      </header>

      <div className="mt-2 min-h-0 flex-1">
        <LifelineTimeline>
          {products.map((product, index) => {
            const no = lineNo(product.line);
            return (
            <LifelineNode
              key={product.slug}
              index={index}
              label={product.name}
              sublabel={formatDay(product.date)}
              badge={<LineBadge line={product.line} no={no} />}
              ringClassName={LINE_CLASSES[product.line].ring}
              center
              className="max-w-[280px] sm:w-[340px]"
            >
              <Link href={product.href} className="group block transition active:scale-[0.98]">
                {/* 站内信息牌图版：细线框 + 图版底衬 + 套准十字 */}
                <div className="plate-reg relative border border-hairline bg-plate p-1.5">
                  <span aria-hidden className="plate-reg-marks" />
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper">
                    <Image
                      src={product.cover}
                      alt={product.name}
                      fill
                      sizes="(min-width: 640px) 420px, 80vw"
                      className="object-cover object-top transition-transform duration-(--dur-base) group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
                {/* 图签：线路编号牌 + 名称 */}
                <div className="mt-3 flex items-baseline gap-2">
                  <LineBadge line={product.line} no={no} />
                  <h2 className="font-display text-[15px] font-semibold tracking-[0.02em]">
                    {product.name}
                  </h2>
                  <ArrowUpRight className="size-4.5 self-center text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </div>
                <p className="mt-1 text-[12.5px] text-ink-soft">{product.tagline}</p>
              </Link>
              <p className="mt-3 text-[12.5px] leading-[1.5] text-ink-soft">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.stats.map((stat) => (
                  <span
                    key={stat}
                    className="border border-hairline px-2 py-0.5 font-mono text-[11.5px] text-ink-soft"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </LifelineNode>
            );
          })}

          {/* 关于节点：让首次访问者知道这是什么（CC BY 署名收在这里） */}
          <LifelineNode
            index={products.length}
            label="关于"
            sublabel="本站"
            center
          >
            <div className="border border-hairline bg-plate p-5">
              <p className="font-mono text-[11.5px] text-ink-faint">附注</p>
              <p className="mt-3 text-[12.5px] leading-[1.5] font-medium text-ink">
                这里收录我做的设计工具与参考产品。
              </p>
              <p className="mt-4 text-[12.5px] leading-[1.5] text-ink-soft">
                每个产品都是线路上的一处车站，从最早的出发，向右生长。右侧的虚线段是留给下一条线的位置——这张图会一直延伸下去。
              </p>
              <p className="mt-4 border-t border-hairline pt-3 text-[11.5px] leading-[1.5] text-ink-faint">
                布局参考图鉴改编自{' '}
                <a
                  href={upstream.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {upstream.name}
                </a>{' '}
                ，依{' '}
                <a
                  href={upstream.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {upstream.license}
                </a>{' '}
                许可使用。
              </p>
            </div>
          </LifelineNode>

          {/* 规划站：虚线圆环 + 灰虚线段，线路图的「未来」一端 */}
          <LifelineNode
            index={products.length + 1}
            label="接下来"
            sublabel="规划中"
            ringClassName="border-dashed border-hairline-strong"
            center
          >
            <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 border border-dashed border-hairline-strong text-ink-faint">
              <span className="font-mono text-[15px]">?</span>
              <span className="font-mono text-[11.5px]">下一线路 · 规划中</span>
            </div>
          </LifelineNode>
        </LifelineTimeline>
      </div>
    </div>
  );
}
