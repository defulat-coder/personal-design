'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

interface HoverPreviewApi {
  show: (src: string, alt: string) => void;
  hide: () => void;
}

const HoverPreviewContext = createContext<HoverPreviewApi | null>(null);

export function useHoverPreview(): HoverPreviewApi | null {
  return useContext(HoverPreviewContext);
}

/**
 * 光标跟随浮动预览图（参考 odunsi.design：lerp 跟随 + 速度映射 tilt）。
 * 仅在 hover + fine pointer 设备上生效；触屏直接忽略。
 */
export function HoverPreviewProvider({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const state = useRef({
    visible: false,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    raf: 0,
  });

  const loopRef = useRef<(time?: number) => void>(() => {});
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastTime: number | undefined;
    loopRef.current = (time?: number) => {
      const s = state.current;
      const wrap = wrapRef.current;
      s.raf = 0;
      if (!wrap) return;
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      // 按帧间隔归一化 lerp，120Hz 屏手感与 60Hz 一致；RM 时直接吸附、无 tilt
      const dt =
        lastTime !== undefined && time !== undefined ? time - lastTime : 16.7;
      const factor = reduced.matches
        ? 1
        : 1 - Math.pow(1 - 0.18, dt / 16.7);
      s.x += dx * factor;
      s.y += dy * factor;
      lastTime = time;
      const tilt = reduced.matches
        ? 0
        : Math.max(-10, Math.min(10, dx * 0.12));
      // 防止预览图溢出视口右/下边缘（3:4 预览图高约 300px）
      const px = Math.min(s.x, window.innerWidth - 260);
      const py = Math.min(s.y, window.innerHeight - 330);
      wrap.style.transform = `translate3d(${px + 20}px, ${py + 24}px, 0) rotate(${tilt}deg)`;
      if (s.visible || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        s.raf = requestAnimationFrame((t) => loopRef.current(t));
      } else {
        lastTime = undefined;
      }
    };
  }, []);

  const kick = useCallback(() => {
    const s = state.current;
    if (!s.raf) s.raf = requestAnimationFrame((t) => loopRef.current(t));
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const s = state.current;
      s.tx = event.clientX;
      s.ty = event.clientY;
      if (s.visible) kick();
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [kick]);

  const show = useCallback(
    (src: string, alt: string) => {
      if (
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ) {
        return;
      }
      const s = state.current;
      const wrap = wrapRef.current;
      const img = imgRef.current;
      if (!wrap || !img) return;
      if (!s.visible) {
        s.x = s.tx;
        s.y = s.ty;
      }
      s.visible = true;
      if (!img.src.endsWith(src)) {
        img.src = src;
        img.alt = alt;
        // 未缓存的图先不显形，避免空白白卡
        if (!img.complete) {
          wrap.style.opacity = '0';
          img.onload = () => {
            if (state.current.visible) wrap.style.opacity = '1';
          };
          kick();
          return;
        }
      }
      wrap.style.opacity = '1';
      kick();
    },
    [kick],
  );

  const hide = useCallback(() => {
    state.current.visible = false;
    if (wrapRef.current) wrapRef.current.style.opacity = '0';
  }, []);

  return (
    <HoverPreviewContext.Provider value={{ show, hide }}>
      {children}
      <div
        ref={wrapRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[70] opacity-0 transition-opacity duration-200 will-change-transform"
      >
        {/* 动态 src，用原生 img 即可 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt=""
          decoding="async"
          className="w-56 rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15"
        />
      </div>
    </HoverPreviewContext.Provider>
  );
}
