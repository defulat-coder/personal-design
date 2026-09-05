'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import styles from './category-tabs.module.css';
import { Button } from './button';
import { cn } from '@/lib/utils';

/** ?cat= 参数读写：active 派生 + select（replace 不产生历史记录） */
export function useCatParam(allowed?: readonly string[]): [active: string, select: (name: string) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = searchParams.get('cat') ?? '全部';
  const active = requested === '全部' || !allowed || allowed.includes(requested) ? requested : '全部';
  useEffect(() => {
    if (requested === active) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cat');
    router.replace(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false });
  }, [requested, active, searchParams, pathname, router]);
  const select = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (name === '全部') {
      params.delete('cat');
    } else {
      params.set('cat', name);
    }
    const next = params.toString();
    router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
  };
  return [active, select];
}

/** 原生分类筛选组：选中下划线，单行可滚动，焦点自动进入可见区。 */
export function CategoryTabs({
  categories,
  total,
  active,
  onSelect,
  className,
}: {
  categories: { name: string; count: number }[];
  /** 「全部」tab 的计数（= 条目总数） */
  total: number;
  active: string;
  onSelect: (name: string) => void;
  line: 'muse' | 'layouts';
  className?: string;
}) {
  return (
    <div role="group" aria-label="分类" className={cn(styles.tabs, className)}>
      {[{ name: '全部', count: total }, ...categories].map((category) => (
        <Button
          variant="ghost"
          key={category.name}
          type="button"
          aria-pressed={active === category.name}
          onClick={() => onSelect(category.name)}
          className={styles.tab}
          onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
        >
          {category.name}
          <span className={styles.count}>
            {category.count}
          </span>
        </Button>
      ))}
    </div>
  );
}
