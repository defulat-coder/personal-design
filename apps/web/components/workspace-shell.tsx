'use client';

import Link from 'next/link';
import { ArrowUpLeft } from 'lucide-react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { products } from '@/lib/products';
import { ThemeToggle } from './theme-toggle';
import styles from './workspace-shell.module.css';

/** 首页就是产品菜单；内页仅提供回到首页的出口，不重复产品导航。 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const currentProduct = products.find(product => pathname === product.href || pathname.startsWith(`${product.href}/`));
  const title = currentProduct?.name ?? '作品时间轴';
  const isLanding = isHome || pathname === currentProduct?.href;
  useEffect(() => {
    const keyboard = () => { document.documentElement.dataset.input = 'keyboard'; };
    const pointer = () => { document.documentElement.dataset.input = 'pointer'; };
    window.addEventListener('keydown', keyboard, true);
    window.addEventListener('pointerdown', pointer, true);
    window.addEventListener('pointermove', pointer, { passive: true });
    return () => {
      window.removeEventListener('keydown', keyboard, true);
      window.removeEventListener('pointerdown', pointer, true);
      window.removeEventListener('pointermove', pointer);
    };
  }, []);
  return (
    <div className={styles.shell}>
      <a href="#workspace-content" className={styles.skip}>跳至内容</a>
      <header className={`${styles.header} ${isHome ? '' : styles.innerHeader}`}>
        <Link href="/" className={styles.brand} title={isHome ? undefined : '返回首页'} aria-label={isHome ? '作品时间轴首页' : `${title}，返回首页`}>
          {!isHome && <ArrowUpLeft className={styles.backIcon} size={18} aria-hidden="true" />}
          {isLanding ? <h1>{title}</h1> : <span>{title}</span>}
        </Link>
        <ThemeToggle />
      </header>
      <div id="workspace-content" tabIndex={-1} className={styles.content}>{children}</div>
    </div>
  );
}
