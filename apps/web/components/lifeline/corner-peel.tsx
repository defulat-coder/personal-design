'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { HoverPreviewProvider } from './hover-preview';
import { LightboxProvider } from './lightbox';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HANDLE = 96;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * 撕角彩蛋（参考 odunsi.design 的 PaperPlaygroundReveal）：
 * 拖拽右上角纸角，front 层被 clip-path 三角裁掉，露出 back 层；
 * 松手按阈值吸附开/合；打开后左下角出现「拉回来」纸角。
 */
export function CornerPeel({
  front,
  back,
  hint = '拉开看看',
  backHint = '拉回来',
}: {
  front: ReactNode;
  back: ReactNode;
  hint?: string;
  backHint?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);
  const openRef = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [peel, setPeel] = useState({ dx: 0, dy: 0 });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // 首访招手：纸角掀起超过静止手柄（>96px）露出下层暗色，提示「可拖」。
  // 每会话只播一次；reduced-motion 跳过。
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('peel-teased')) return;
    sessionStorage.setItem('peel-teased', '1');
    const timers = [
      setTimeout(() => {
        if (!dragRef.current && !openRef.current) {
          setPeel({ dx: 168, dy: 168 });
        }
      }, 1600),
      setTimeout(() => {
        if (!dragRef.current && !openRef.current) {
          setPeel((current) =>
            current.dx === 168 && current.dy === 168
              ? { dx: 0, dy: 0 }
              : current,
          );
        }
      }, 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // 跟踪容器尺寸；打开状态下尺寸变化时保持全开
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      setSize({ w, h });
      setPeel((current) =>
        current.dx > 0 && current.dx >= w - 1 ? { dx: w, dy: h } : current,
      );
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const snap = useCallback(
    (dx: number, dy: number) => {
      const progress = size.w && size.h ? (dx / size.w + dy / size.h) / 2 : 0;
      if (progress > 0.3) {
        setPeel({ dx: size.w, dy: size.h });
        setOpen(true);
      } else {
        setPeel({ dx: 0, dy: 0 });
        setOpen(false);
      }
    },
    [size],
  );

  const close = useCallback(() => {
    setPeel({ dx: 0, dy: 0 });
    setOpen(false);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPeel({
      dx: clamp(rect.width - x, 0, rect.width),
      dy: clamp(y, 0, rect.height),
    });
  };

  const onPointerUp = () => {
    if (!dragRef.current) return;
    dragRef.current = false;
    setDragging(false);
    snap(peel.dx, peel.dy);
  };

  const measured = size.w > 0 && size.h > 0;
  // 手柄尺寸随视口收缩：桌面 96px，窄屏最多 22vw（390px 手机不再占 1/4 屏宽）
  const handle = measured ? Math.min(HANDLE, size.w * 0.22) : HANDLE;
  const flapW = Math.max(peel.dx, handle);
  const flapH = Math.max(peel.dy, handle);
  const foldAngle = Math.atan2(flapH, flapW);
  const foldLength = Math.hypot(flapW, flapH);

  return (
    <HoverPreviewProvider>
      <LightboxProvider>
        <div
          ref={rootRef}
          data-peel-open={open ? 'true' : 'false'}
          className="relative h-full overflow-hidden"
        >
          {/* 下层：撕开后露出（关闭时退出 Tab 序并对读屏隐藏） */}
          <div
            ref={backRef}
            className="absolute inset-0"
            inert={!open}
            aria-hidden={!open}
          >
            {back}
          </div>

          {/* 上层：主页面，被纸角 clip 掉；全开后整层隐藏，终态干净 */}
          <div
            className="absolute inset-0 bg-[#fafafa]"
            style={{
              clipPath: measured
                ? `polygon(0 0, ${size.w - peel.dx}px 0, ${size.w}px ${peel.dy}px, 100% 100%, 0 100%)`
                : undefined,
              visibility: open ? 'hidden' : 'visible',
              transition:
                dragging || reducedMotion
                  ? 'none'
                  : `clip-path 700ms ${EASE}, visibility 0s linear ${open ? '700ms' : '0s'}`,
              pointerEvents: open ? 'none' : 'auto',
            }}
          >
            {front}
          </div>

          {/* 右上角纸角（拖拽手柄） */}
          <div
            role="button"
            tabIndex={open ? -1 : 0}
            aria-label={hint}
            aria-expanded={open}
            className={cn(
              'absolute top-0 right-0 z-20 touch-none cursor-grab select-none active:cursor-grabbing',
              open && 'pointer-events-none opacity-0',
            )}
            style={{
              width: flapW,
              height: flapH,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              transition:
                dragging || reducedMotion
                  ? 'none'
                  : `width 700ms ${EASE}, height 700ms ${EASE}, opacity 300ms ${EASE}`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setPeel({ dx: size.w, dy: size.h });
                setOpen(true);
                // 键盘打开后焦点移入墙内，不停留在已隐藏的手柄上
                window.setTimeout(() => {
                  backRef.current
                    ?.querySelector<HTMLElement>('button, a[href]')
                    ?.focus();
                }, 750);
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-300 shadow-[-14px_14px_28px_rgba(0,0,0,0.2)] backdrop-blur-[2px]" />
            {/* 折痕线 */}
            <div
              aria-hidden
              className="absolute top-0 left-0 h-px origin-top-left bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
              style={{
                width: foldLength,
                transform: `rotate(${foldAngle}rad)`,
              }}
            />
          </div>

          {/* 关闭状态的提示（呼吸微动效，暗示可拖） */}
          <p
            aria-hidden
            className={cn(
              'lifeline-hint pointer-events-none absolute top-16 right-6 z-10 text-xs font-medium text-neutral-400 transition-opacity duration-300',
              (open || dragging) && 'opacity-0',
            )}
          >
            {hint} ↗
          </p>

          {/* 左下角「拉回来」纸角 */}
          <div
            role="button"
            tabIndex={open ? 0 : -1}
            aria-label={backHint}
            className={cn(
              'absolute bottom-0 left-0 z-20 cursor-pointer select-none',
              !open && 'pointer-events-none opacity-0',
            )}
            style={{
              width: handle,
              height: handle,
              clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
              transition: `opacity 400ms ${EASE}`,
            }}
            onClick={close}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                close();
              }
            }}
          >
            <div className="absolute inset-0 bg-neutral-700/75 shadow-[14px_-14px_28px_rgba(0,0,0,0.2)] backdrop-blur-[2px]" />
          </div>

          <p
            aria-hidden
            className={cn(
              'pointer-events-none absolute bottom-16 left-6 z-10 text-xs font-medium text-neutral-500 transition-opacity duration-300 max-sm:hidden',
              !open && 'opacity-0',
            )}
          >
            ↙ {backHint}
          </p>
        </div>
      </LightboxProvider>
    </HoverPreviewProvider>
  );
}
