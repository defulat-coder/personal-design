'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** 容器两端的渐隐宽度（px），暗示「两侧还有内容」 */
const EDGE_FADE = 40;

/** 列车点惯性：对进度做二次 lerp（同一 rAF 循环内），行驶中轻微尾随、停车时滑入站位 */
const TRAIN_LERP = 0.3;

export interface LifelineTimelineApi {
  /** 平滑滚动到第 index 个节点 */
  scrollToNode: (index: number) => void;
}

/**
 * 横向 lifeline 时间轴容器。
 * 桌面端（hover + fine pointer）：滚轮/触控板映射横向位移（rAF lerp 平滑 + 松手惯性）、
 * 鼠标拖拽、方向键；移动端回退为原生横向滚动（scroll-snap 对齐节点）。
 * 节点列内部可垂直滚动（滚轮悬停在列上时优先滚列，滚到底/顶后交给时间轴）。
 */
export const LifelineTimeline = forwardRef<
  LifelineTimelineApi,
  {
    children: ReactNode;
    className?: string;
    /** 轨道溢出状态变化时回调（用于联动「可探索」类文案与渐隐） */
    onScrollableChange?: (scrollable: boolean) => void;
  }
>(function LifelineTimeline({ children, className, onScrollableChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trainRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  // 列车点的二次平滑进度（0-1），见 TRAIN_LERP
  const trainProgressRef = useRef(0);
  const rafRef = useRef(0);
  const dragRef = useRef<{
    startX: number;
    startTarget: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [nativeScroll, setNativeScroll] = useState(true);
  const [grabbing, setGrabbing] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  // 渐隐宽度对齐轨道内边距（移动端 px-6=24 < EDGE_FADE，否则首节点被切字）
  const [edgeFade, setEdgeFade] = useState(EDGE_FADE);

  // 触屏 / 窄屏用原生横向滚动，桌面端用自定义驱动
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (max-width: 767px)');
    const update = () => setNativeScroll(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const maxOffset = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return 0;
    return Math.max(0, track.scrollWidth - container.clientWidth);
  }, []);

  // 轨道是否溢出可滚（图片加载会改变 scrollWidth，用 RO 跟踪）
  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;
    const update = () => {
      const next = track.scrollWidth > container.clientWidth + 1;
      setScrollable(next);
      onScrollableChange?.(next);
      const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      setEdgeFade(Math.min(EDGE_FADE, padding));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    observer.observe(container);
    return () => observer.disconnect();
  }, [onScrollableChange]);

  // 列车进度点：沿线移动（dot 固定在视口层，x = 进度 × 可视轨宽）
  const placeTrain = useCallback((progress: number) => {
    const train = trainRef.current;
    const container = containerRef.current;
    if (!train || !container) return;
    const w = container.clientWidth;
    const inset = Math.min(40, w * 0.12);
    const x = inset + clamp(progress, 0, 1) * (w - inset * 2) - 6.5;
    train.style.transform = `translate3d(${x}px, 0, 0)`;
  }, []);

  const tickRef = useRef<(time?: number) => void>(() => {});
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastTime: number | undefined;
    tickRef.current = (time?: number) => {
      rafRef.current = 0;
      const track = trackRef.current;
      if (!track) return;
      // 按帧间隔归一化 lerp，120Hz 屏手感与 60Hz 一致
      const dt =
        lastTime !== undefined && time !== undefined ? time - lastTime : 16.7;
      const diff = targetRef.current - currentRef.current;
      if (reduced.matches || Math.abs(diff) < 0.1) {
        currentRef.current = targetRef.current;
      } else {
        currentRef.current += diff * (1 - Math.pow(1 - 0.12, dt / 16.7));
      }
      lastTime = time;
      track.style.transform = `translate3d(${-currentRef.current}px, 0, 0)`;
      const max = maxOffset();
      const progress = max > 0 ? currentRef.current / max : 0;
      // 列车惯性：进度再过一次更慢的 lerp，行驶中尾随、停车时滑入站位
      const trainDiff = progress - trainProgressRef.current;
      if (reduced.matches || Math.abs(trainDiff) < 0.0005) {
        trainProgressRef.current = progress;
      } else {
        trainProgressRef.current +=
          trainDiff * (1 - Math.pow(1 - TRAIN_LERP, dt / 16.7));
      }
      placeTrain(trainProgressRef.current);
      if (
        currentRef.current !== targetRef.current ||
        trainProgressRef.current !== progress
      ) {
        rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
      } else {
        lastTime = undefined;
      }
    };
  }, [maxOffset, placeTrain]);

  const schedule = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
    }
  }, []);

  // 自定义驱动：轨道状态变化后初始化列车点位置
  useEffect(() => {
    if (!nativeScroll) schedule();
  }, [nativeScroll, scrollable, schedule]);

  // 原生滚动（移动端回退）：scroll 事件直接驱动列车点
  useEffect(() => {
    const container = containerRef.current;
    if (!nativeScroll || !container) return;
    const onScroll = () => {
      const max = container.scrollWidth - container.clientWidth;
      const progress = max > 0 ? container.scrollLeft / max : 0;
      // 原生滚动直接跟随手指；同步惯性基准，切回自定义驱动时不跳变
      trainProgressRef.current = progress;
      placeTrain(progress);
    };
    onScroll();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [nativeScroll, scrollable, placeTrain]);

  const nudge = useCallback(
    (delta: number) => {
      targetRef.current = clamp(targetRef.current + delta, 0, maxOffset());
      schedule();
    },
    [maxOffset, schedule],
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToNode: (index: number) => {
        const track = trackRef.current;
        const container = containerRef.current;
        if (!track || !container) return;
        const node = track.querySelector<HTMLElement>(
          `[data-node-index="${index}"]`,
        );
        if (!node) return;
        // 让节点刻度对齐容器左缘的内容起点（px-6 / sm:px-10 的内边距）
        const padding = container.clientWidth >= 640 ? 40 : 24;
        const target = clamp(
          node.offsetLeft - padding,
          0,
          track.scrollWidth - container.clientWidth,
        );
        if (nativeScroll) {
          // RM 用户跳过平滑滚动（自定义 transform 分支的 tick 已有同样判断）
          const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;
          container.scrollTo({
            left: target,
            behavior: reduced ? 'auto' : 'smooth',
          });
        } else {
          targetRef.current = target;
          schedule();
        }
      },
    }),
    [nativeScroll, schedule],
  );

  // 滚轮 / 触控板 → 横向位移（需要 preventDefault，必须非 passive 监听）
  useEffect(() => {
    if (nativeScroll) return;
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (vertical) {
        // 悬停在可垂直滚动的节点列上时，优先让列滚动；滚到头后交给时间轴
        const column = (event.target as Element).closest?.(
          '[data-lifeline-column]',
        ) as HTMLElement | null;
        if (column && column.scrollHeight > column.clientHeight + 1) {
          const atTop = column.scrollTop <= 0 && event.deltaY < 0;
          const atBottom =
            column.scrollTop + column.clientHeight >=
              column.scrollHeight - 1 && event.deltaY > 0;
          if (!atTop && !atBottom) return;
        }
      }
      event.preventDefault();
      nudge(vertical ? event.deltaY : event.deltaX);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [nativeScroll, nudge]);

  // 视口尺寸变化时收敛位移
  useEffect(() => {
    if (nativeScroll) return;
    const onResize = () => {
      targetRef.current = clamp(targetRef.current, 0, maxOffset());
      currentRef.current = clamp(currentRef.current, 0, maxOffset());
      schedule();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [nativeScroll, maxOffset, schedule]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (nativeScroll || event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }
    dragRef.current = {
      startX: event.clientX,
      startTarget: targetRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 6) setGrabbing(true);
    // 指数平滑的拖拽速度，松手时做惯性
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) {
      drag.velocity =
        0.8 * drag.velocity + 0.2 * ((event.clientX - drag.lastX) / dt);
      drag.lastX = event.clientX;
      drag.lastT = now;
    }
    if (Math.abs(dx) > 2) {
      targetRef.current = clamp(drag.startTarget - dx, 0, maxOffset());
      schedule();
    }
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;
    if (grabbing) {
      // 拖拽刚结束时吞掉一次 click，避免误触链接
      suppressClickRef.current = true;
      // 松手惯性：按当前速度追加一段位移，lerp 自然衰减成缓停
      if (Math.abs(drag.velocity) > 0.15) {
        targetRef.current = clamp(
          targetRef.current - drag.velocity * 220,
          0,
          maxOffset(),
        );
        schedule();
      }
    }
    dragRef.current = null;
    setGrabbing(false);
  };

  const onClickCapture = (event: React.SyntheticEvent) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const step = container.clientWidth * 0.5;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nudge(step);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nudge(-step);
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetRef.current = 0;
      schedule();
    } else if (event.key === 'End') {
      event.preventDefault();
      targetRef.current = maxOffset();
      schedule();
    }
  };

  // 焦点进入屏外节点时，把它滚动进视口（自定义 transform 模式下浏览器不会自动跟随）
  const onFocusCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (nativeScroll) return;
    const track = trackRef.current;
    if (!track) return;
    const node = (event.target as Element).closest?.(
      '[data-node-index]',
    ) as HTMLElement | null;
    if (!node) return;
    const container = containerRef.current;
    if (!container) return;
    const left = node.offsetLeft - currentRef.current;
    const right = left + node.offsetWidth;
    if (left < 0 || right > container.clientWidth) {
      targetRef.current = clamp(
        node.offsetLeft - 40,
        0,
        track.scrollWidth - container.clientWidth,
      );
      schedule();
    }
  };

  // 轨道可滚时才用两端渐隐（不可滚时渐隐是在暗示不存在的内容）
  const mask = scrollable
    ? {
        maskImage: `linear-gradient(to right, transparent, black ${edgeFade}px, black calc(100% - ${edgeFade}px), transparent)`,
        WebkitMaskImage: `linear-gradient(to right, transparent, black ${edgeFade}px, black calc(100% - ${edgeFade}px), transparent)`,
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="时间轴"
      tabIndex={0}
      className={cn(
        'relative h-full min-h-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        nativeScroll
          ? 'snap-x snap-mandatory scroll-pl-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:scroll-pl-10 [&::-webkit-scrollbar]:hidden'
          : grabbing
            ? 'cursor-grabbing overflow-hidden'
            : 'cursor-grab overflow-hidden',
        className,
      )}
      style={mask}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={onClickCapture}
      onFocusCapture={onFocusCapture}
      onKeyDown={onKeyDown}
    >
      <div
        ref={trackRef}
        className="relative flex h-full w-max min-w-full gap-10 px-6 will-change-transform sm:px-10"
      >
        {/* 3px 线路带：已通车段 ink 实线 + 最右端「接下来」规划段虚线 */}
        <div
          aria-hidden
          className={cn(
            'lifeline-rail absolute inset-x-0 top-36 h-[3px]',
            scrollable &&
              '[mask-image:linear-gradient(to_right,black_calc(100%-120px),transparent)]',
          )}
        >
          <div className="absolute inset-y-0 right-[calc(72vw+40px)] left-0 bg-ink sm:right-[380px]" />
          <div className="rail-planned absolute inset-y-0 right-0 w-[calc(72vw+40px)] sm:w-[380px]" />
        </div>
        {children}
      </div>

      {/* 列车进度点：随滚动进度沿线移动（轨道可滚时才显示） */}
      {scrollable ? (
        <div
          ref={trainRef}
          aria-hidden
          className="pointer-events-none absolute top-[139px] left-0 size-[13px] rounded-full border-[3px] border-paper bg-ink will-change-transform"
        />
      ) : null}
    </div>
  );
});

/** 时间轴上的一个站：空心圆环站 + 45° 斜排站名标注 + 下方内容栏 */
export function LifelineNode({
  index,
  label,
  sublabel,
  badge,
  ringClassName,
  center = false,
  header,
  children,
  className,
}: {
  index: number;
  label: string;
  sublabel?: string;
  /** 线路编号牌（直角色底小方块），渲染在 45° 标注行内 */
  badge?: ReactNode;
  /** 站环样式覆写（产品站 hover 染线路色；规划站用虚线环） */
  ringClassName?: string;
  /** 内容不足一屏时垂直居中（内容超出时仍从顶部滚） */
  center?: boolean;
  /** 列头插槽：渲染在标签与滚动列之间，常驻可见（如二级主题 chips） */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-node-index={index}
      className={cn(
        'lifeline-node group relative flex w-[72vw] max-w-[300px] shrink-0 snap-start flex-col pt-40 sm:w-[340px] sm:max-w-none',
        className,
      )}
      style={{ '--i': index } as CSSProperties}
    >
      {/* 站环：正圆纸色心 + 2px ink 边，骑在线路带上（hover 可染线路色） */}
      <span
        aria-hidden
        className={cn(
          'absolute top-[138px] left-0 z-10 size-[15px] rounded-full border-2 bg-paper transition-colors',
          ringClassName ?? 'border-ink',
        )}
      />
      {/* 45° 斜排站名标注（地铁图签名排版）：编号牌 + 站名 + mono 数据 */}
      <div className="absolute top-[112px] left-[10px] flex origin-bottom-left -rotate-45 items-center gap-1.5 whitespace-nowrap">
        {badge}
        <span className="font-display text-[15px] font-semibold tracking-[0.02em] text-ink">
          {label}
        </span>
        {sublabel ? (
          <span className="font-mono text-[10.5px] text-ink-faint">
            {sublabel}
          </span>
        ) : null}
      </div>
      {header ? <div className="shrink-0 pb-2">{header}</div> : null}
      <div
        data-lifeline-column
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-10 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-hairline-strong"
      >
        {center ? <div className="my-auto">{children}</div> : children}
      </div>
    </section>
  );
}
