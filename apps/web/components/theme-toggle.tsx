'use client';

/**
 * 明暗主题切换钮：24×24 正圆（全站唯二圆形例外之一），fixed 右上。
 * 翻转 html[data-theme] 并写 localStorage('theme')；图标用 dark: 变体切换，
 * 不读 state，首帧即与内联初始化脚本一致（无闪烁、无水合 mismatch）。
 */
export function ThemeToggle() {
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
    <button
      type="button"
      onClick={toggle}
      aria-label="切换明暗主题"
      className="fixed top-[30px] right-[30px] z-50 flex size-6 items-center justify-center rounded-full text-ink transition-colors hover:bg-plate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
    </button>
  );
}
