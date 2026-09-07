'use client';

import { Suspense, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, buttonClassName } from './button';
import { DetailKeyboardNav } from './detail-tools';
import { resolveBrowseContext, type BrowseEntry } from '@/lib/browse-context';
import styles from './browse-navigation.module.css';

type Props = { listPath:string; storageKey:string; returnLabel:string; fallbackHref:string; currentHref:string; entries:BrowseEntry[] };
const subscribe = () => () => {};

export function BrowseNavigation(props: Props) {
  return <Suspense fallback={<Navigation {...props} />}><ContextNavigation {...props} /></Suspense>;
}

function ContextNavigation(props: Props) {
  const params = useSearchParams();
  const raw = useSyncExternalStore(subscribe, () => { try { return sessionStorage.getItem(props.storageKey); } catch { return null; } }, () => null);
  const context = useMemo(() => params.get('browse') === '1' ? resolveBrowseContext(raw, props.listPath, props.currentHref) : null, [raw, props.listPath, props.currentHref, params]);
  return <Navigation {...props} fallbackHref={context?.href ?? props.fallbackHref} entries={context?.entries ?? props.entries} fromList={!!context} />;
}

function Navigation({ returnLabel, fallbackHref, currentHref, entries, listPath, fromList = false }: Props & { fromList?:boolean }) {
  const index = entries.findIndex(entry => entry.href === currentHref);
  const prev = entries[index - 1];
  const next = entries[index + 1];
  const href = (entry: BrowseEntry) => `${entry.href}${fromList ? '?browse=1' : ''}`;
  return <>
    <nav className={styles.navigation} aria-label="作品导航">
      <Link href={fallbackHref} scroll={false} className={buttonClassName({ variant:'ghost' })}><ArrowLeft size={16} aria-hidden />{returnLabel}</Link>
      <div className={styles.adjacent}>
        {prev ? <Link href={href(prev)} title={prev.title} aria-label={`上一件：${prev.title}`} className={buttonClassName({variant:'ghost'})}><ArrowLeft size={16} aria-hidden /><span>上一件</span></Link> : <Button variant="ghost" disabled aria-label="已是第一件"><ArrowLeft size={16} aria-hidden /><span>上一件</span></Button>}
        {next ? <Link href={href(next)} title={next.title} aria-label={`下一件：${next.title}`} className={buttonClassName({variant:'ghost'})}><span>下一件</span><ArrowRight size={16} aria-hidden /></Link> : <Button variant="ghost" disabled aria-label="已是最后一件"><span>下一件</span><ArrowRight size={16} aria-hidden /></Button>}
      </div>
    </nav>
    <DetailKeyboardNav prevHref={prev ? href(prev) : undefined} nextHref={next ? href(next) : undefined} hrefPattern={`^${listPath}/`} />
  </>;
}
