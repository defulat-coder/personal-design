import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      {/* 未开通站记号：断开的规划虚线段 + 虚线环站（与首页「接下来」站同词汇） */}
      <div className="mb-8 flex w-56 items-center" aria-hidden="true">
        <span className="flex-1 border-t-[3px] border-dashed border-hairline-strong" />
        <span className="mx-1 size-[15px] rounded-full border-2 border-dashed border-hairline-strong bg-paper" />
        <span className="flex-1 border-t-[3px] border-dashed border-hairline-strong" />
      </div>
      <h1 className="font-display text-[42px] leading-none font-semibold text-ink sm:text-[56px]">
        此站尚未开通
      </h1>
      <p className="mt-4 text-[11.5px] text-ink-soft">
        <span className="font-mono">404</span> · 你到达的坐标不在任何已通车线路上
      </p>
      <div className="mt-10 flex items-center gap-3 text-[12.5px]">
        <Link
          href="/"
          className="bg-ink px-4 py-2 text-plate transition-colors hover:bg-ink/85"
        >
          回到线路图
        </Link>
        <Link
          href="/products/layout-compositions"
          className="border border-hairline px-4 py-2 text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          去布局参考
        </Link>
      </div>
    </main>
  );
}
