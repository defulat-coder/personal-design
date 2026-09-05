'use client';

import Link from 'next/link';
import { Button, buttonClassName } from '@/components/button';

export default function MuseError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6 py-12">
    <h1 className="text-[26px] leading-[1.35] font-semibold">灵感暂时无法打开</h1>
    <p className="text-ink-soft">内容加载时遇到了问题。可以重试；当前地址中的搜索与分类条件会保留。</p>
    <div className="flex flex-wrap gap-3"><Button variant="primary" onClick={reset}>重新加载</Button><Link href="/products/muse" className={buttonClassName()}>返回灵感集</Link></div>
  </main>;
}
