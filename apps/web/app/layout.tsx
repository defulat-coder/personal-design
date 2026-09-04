import type { Metadata } from 'next';
import { Barlow_Condensed } from 'next/font/google';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Personal Design · 产品集',
    template: '%s · Personal Design',
  },
  description: '设计工具与参考产品集。',
};

/* 展示字（刊头大字、站名、产品名）；CJK 无字重，落 @theme 里的系统栈 */
const barlow = Barlow_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-barlow',
});

// 主题初始化：首帧前读 localStorage('theme')，缺省跟系统；同步脚本防 FOUC
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`min-h-screen ${barlow.variable}`}>
        {/* 主题初始化必须在首帧前同步执行，防 FOUC */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
