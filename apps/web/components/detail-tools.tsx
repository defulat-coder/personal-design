'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LightboxProvider,
  useLightbox,
  type LightboxItem,
} from './lifeline/lightbox';

/** 详情页主图：点击进入灯箱（FLIP 放大，siblings = 同二级主题） */
export function DetailMainImage(props: {
  src: string;
  thumb: string;
  alt: string;
  serial: string;
  siblings: LightboxItem[];
  index: number;
}) {
  return (
    <LightboxProvider>
      <MainImageButton {...props} />
    </LightboxProvider>
  );
}

function MainImageButton({
  src,
  thumb,
  alt,
  serial,
  siblings,
  index,
}: {
  src: string;
  thumb: string;
  alt: string;
  serial: string;
  siblings: LightboxItem[];
  index: number;
}) {
  const lightbox = useLightbox();
  return (
    <button
      type="button"
      aria-label={`放大查看 ${alt}`}
      className="relative block h-full w-full cursor-zoom-in"
      onClick={(event) =>
        lightbox?.open(
          { src, thumb, alt, serial },
          {
            rect: event.currentTarget.getBoundingClientRect(),
            sourceEl: event.currentTarget,
            siblings,
            index,
          },
        )
      }
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-contain"
      />
    </button>
  );
}

/** 详情页键盘 ←/→ 翻页（与灯箱翻页心智一致）；并负责 detail-in 翻页跳过标记 */
export function DetailKeyboardNav({
  prevHref,
  nextHref,
}: {
  prevHref?: string;
  nextHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // 详情→详情导航后跳过一次入场动画：离开前记下目标路径，
  // 路径真正到达后才消费（导航过渡期间旧树也会跑 effect，不能提前消费；
  // StrictMode 双跑 effect，已消费过的实例不能走 else 删除分支）
  const consumedNavRef = useRef(false);
  useEffect(() => {
    const target = sessionStorage.getItem('detail-nav');
    if (target && target === pathname) {
      sessionStorage.removeItem('detail-nav');
      consumedNavRef.current = true;
      document.documentElement.dataset.detailNav = 'true';
    } else if (!target && !consumedNavRef.current) {
      delete document.documentElement.dataset.detailNav;
    }
  }, [pathname]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.('a[href]');
      const href = anchor?.getAttribute('href') ?? '';
      if (/^\/products\/layout-compositions\/\d+/.test(href)) {
        sessionStorage.setItem('detail-nav', href);
      }
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // 灯箱打开时让灯箱消费方向键（灯箱翻图），不跳详情页
      if (document.body.dataset.lightboxOpen === 'true') return;
      if (event.key === 'ArrowLeft' && prevHref) {
        event.preventDefault();
        sessionStorage.setItem('detail-nav', prevHref);
        router.push(prevHref);
      } else if (event.key === 'ArrowRight' && nextHref) {
        event.preventDefault();
        sessionStorage.setItem('detail-nav', nextHref);
        router.push(nextHref);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, prevHref, nextHref]);
  return null;
}
