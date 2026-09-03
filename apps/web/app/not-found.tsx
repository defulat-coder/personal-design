import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        页面不存在或已移动
      </h1>
      <div className="mt-8 flex items-center gap-3 text-sm">
        <Link
          href="/"
          className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700"
        >
          回到首页
        </Link>
        <Link
          href="/products/layout-compositions"
          className="rounded-full border border-neutral-200 px-4 py-2 text-neutral-600 transition hover:border-neutral-400"
        >
          去布局参考
        </Link>
      </div>
    </main>
  );
}
