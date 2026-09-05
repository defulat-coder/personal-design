'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { ArrowLeft } from 'lucide-react';
import { buttonClassName } from '@/components/button';

const subscribe = () => () => {};

/** The resolved return URL stays a real link, including modifier-click/new-tab use. */
export function MuseReturnLink({ fallback = '/products/muse' }: { fallback?: string }) {
  const href = useSyncExternalStore(subscribe, () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('muse-return') ?? 'null');
      if (typeof saved?.href === 'string' && /^\/products\/muse(?:\?|$)/.test(saved.href)) return saved.href;
    } catch {}
    return fallback;
  }, () => fallback);
  return <Link href={href} scroll={false} className={buttonClassName({ variant:'ghost' })}><ArrowLeft size={16} />返回灵感集</Link>;
}
