'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpLeft } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import styles from './workspace-shell.module.css';

/** 首页就是产品菜单；内页仅提供回到首页的出口，不重复产品导航。 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === '/';
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
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label={isHome ? 'Personal Design 首页' : '返回首页'}>
          {!isHome && <ArrowUpLeft size={18} aria-hidden />}
          <span>Personal Design</span>
        </Link>
        <ThemeToggle />
      </header>
      <div id="workspace-content" tabIndex={-1} className={styles.content}>{children}</div>
    </div>
  );
}
