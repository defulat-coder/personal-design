'use client';

import { useEffect } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystem = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem('theme'); } catch { /* Use OS preference when storage is unavailable. */ }
      if (saved !== 'light' && saved !== 'dark') {
        document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
      }
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== 'theme' && event.key !== null) return;
      if (event.newValue === 'light' || event.newValue === 'dark') {
        document.documentElement.dataset.theme = event.newValue;
      } else syncSystem();
    };
    media.addEventListener('change', syncSystem);
    window.addEventListener('storage', syncStorage);
    syncSystem();
    return () => {
      media.removeEventListener('change', syncSystem);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);
  const toggle = () => {
    const next =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 隐私模式等写不进去时，当次切换仍生效
    }
  };

  return (
    <Button
      icon
      onClick={toggle}
      aria-label="切换明暗主题"
      title="切换明暗主题"
    >
      {/* 浅色下显示月亮（点它入夜） */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="size-3.5 dark:hidden"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      {/* 深色下显示太阳（点它天亮） */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="hidden size-3.5 dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </Button>
  );
}
