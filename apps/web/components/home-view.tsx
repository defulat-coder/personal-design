'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ImageOff } from 'lucide-react';
import { instantMotion } from '@/lib/motion';
import type { Product } from '@/lib/products';
import { buttonClassName } from './button';
import { MotionVideo } from './motion-video';
import { SiteReceiptPreview } from './site-receipt-preview';
import styles from './home-view.module.css';

type Preview = { src: string; alt: string; videoSrc?: string };

function PreviewImage({ src, alt, priority = false }: Preview & { priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.imageFrame}>
    {failed || !src ? <div className={styles.mediaError}><ImageOff size={20} strokeWidth={1.5} /><span>预览暂不可用</span></div> :
      <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 640px) 250px, 320px" className={styles.image} onError={() => setFailed(true)} />}
  </div>;
}

export function HomeView({ products, layoutPreviews = [], musePreviews = [] }: { products: Product[]; layoutPreviews?: Preview[]; musePreviews?: Preview[] }) {
  const drag = useRef({ start: 0, scroll: 0, down: false, moved: false });
  const viewport = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const ordered = [...products].sort((a, b) => a.date.localeCompare(b.date));

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', update); };
  }, [products.length]);

  function move(direction: number) {
    const element = viewport.current;
    if (!element) return;
    const cell = element.querySelector('li');
    const step = cell?.getBoundingClientRect().width ?? element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: instantMotion() ? 'instant' : 'smooth' });
  }

  return <main className={styles.home}>
    <header className={styles.intro}>
      <h1>作品时间轴</h1>
      <span className={styles.period}>{ordered[0]?.date.slice(0, 4) ?? new Date().getFullYear()}<span aria-hidden="true">—</span>持续更新</span>
    </header>

    {ordered.length > 0 ? <>
      <div className={styles.timeline}>
        <div ref={viewport} className={styles.viewport} role="region" aria-label="作品时间轴，左右方向键浏览" tabIndex={0}
          onPointerDown={event => {
            if (event.pointerType !== 'mouse' || event.button !== 0 || (edges.start && edges.end)) return;
            drag.current = { start: event.clientX, scroll: event.currentTarget.scrollLeft, down: true, moved: false };
          }}
          onPointerMove={event => {
            const state = drag.current;
            if (!state.down) return;
            if (event.buttons !== 1) { state.down = false; delete event.currentTarget.dataset.dragging; return; }
            const delta = event.clientX - state.start;
            if (Math.abs(delta) > 6) {
              state.moved = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.dataset.dragging = 'true';
            }
            if (state.moved) event.currentTarget.scrollLeft = state.scroll - delta;
          }}
          onPointerUp={event => { drag.current.down = false; delete event.currentTarget.dataset.dragging; }}
          onPointerCancel={event => { drag.current.down = false; delete event.currentTarget.dataset.dragging; }}
          onLostPointerCapture={event => { drag.current.down = false; delete event.currentTarget.dataset.dragging; }}
          onClickCapture={event => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } }}
          onDragStart={event => event.preventDefault()}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
          }}>
          <ol className={styles.entries}>
            {ordered.map((product, index) => {
              const previews = product.slug === 'layout-compositions' ? layoutPreviews : product.slug === 'muse' ? musePreviews : [];
              const isLayout = product.slug === 'layout-compositions';
              return <li key={product.slug} className={styles.entry} style={{ '--order': index } as CSSProperties}>
                <time dateTime={product.date} className={styles.date}>{product.date.replaceAll('-', '.')}{product.dateLabel && ` · ${product.dateLabel}`}</time>
                <div className={styles.rule} aria-hidden="true"><span className={styles.node} /></div>
                <Link href={product.href} className={styles.project} aria-label={`进入${product.name}`}>
                  <div className={styles.title}><h2>{product.name}</h2><ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" /></div>
                  <p className={styles.tagline}>{product.tagline}</p>
                  <div className={`${styles.preview} ${isLayout ? styles.sheets : previews[0]?.videoSrc ? styles.motionPreview : styles.frames}`}>
                    {product.slug === 'personal-sites' ? <SiteReceiptPreview /> : previews[0]?.videoSrc ? <MotionVideo src={previews[0].videoSrc} poster={previews[0].src} aria-label={previews[0].alt} /> : (previews.length ? previews.slice(0, 3) : [{ src: product.cover, alt: `${product.name}内容预览` }]).map((preview, i) => <PreviewImage key={preview.src} {...preview} priority={index === 0 && i === 0} />)}
                  </div>
                  <span className={styles.enter}>{product.href.startsWith('https://') ? '访问网站' : '浏览作品'}<ArrowRight size={15} strokeWidth={1.5} aria-hidden="true" /></span>
                </Link>
              </li>;
            })}
            <li className={`${styles.entry} ${styles.future}`}>
              <span className={styles.date}>未完待续</span>
              <div className={styles.rule} aria-hidden="true"><span className={styles.node} /></div>
            </li>
          </ol>
        </div>
      </div>
      {(!edges.start || !edges.end) && <footer className={styles.footer}>
        <div className={styles.controls}>
          <span className={styles.hint}>拖动或沿时间浏览</span>
          <button className={buttonClassName({ variant: 'ghost', icon: true })} onClick={() => move(-1)} disabled={edges.start} aria-label="向前浏览作品"><ArrowLeft size={18} strokeWidth={1.5} /></button>
          <button className={buttonClassName({ variant: 'ghost', icon: true })} onClick={() => move(1)} disabled={edges.end} aria-label="向后浏览作品"><ArrowRight size={18} strokeWidth={1.5} /></button>
        </div>
      </footer>}
    </> : <p className={styles.empty}>产品正在整理中，稍后再来看看。</p>}
  </main>;
}
