'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import type { Product } from '@/lib/products';
import { buttonClassName } from './button';
import styles from './home-view.module.css';

type Preview = { src: string; alt: string };

function PreviewImage({ src, alt, priority, sheet = false }: Preview & { priority: boolean; sheet?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={sheet ? styles.sheet : styles.scene}>
    {failed || !src ? <div className={styles.mediaError}><ImageOff size={20} strokeWidth={1.5} /><span>预览暂不可用</span></div> :
      <Image src={src} alt={alt} fill priority={priority} sizes={sheet ? '(max-width: 640px) 30vw, 180px' : '(max-width: 640px) 100vw, 600px'} className={styles.image} onError={() => setFailed(true)} />}
  </div>;
}

export function HomeView({ products, layoutPreviews = [], musePreviews = [] }: { products: Product[]; layoutPreviews?: Preview[]; musePreviews?: Preview[] }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.visible = String(entry.isIntersecting);
    }), { threshold: 0.2 });
    root.current?.querySelectorAll("article").forEach(article => observer.observe(article));
    return () => observer.disconnect();
  }, []);
  return <main ref={root} className={styles.home}>
    <header className={styles.intro}>
      <h1>产品集</h1>
    </header>

    <div className={styles.products}>
      {products.map(product => {
        const isLayout = product.slug === 'layout-compositions';
        return <article key={product.slug} className={styles.product}>
          <Link href={product.href} className={styles.productLink} aria-label={`进入${product.name}`}>
            <div className={`${styles.preview} ${isLayout ? styles.layoutPreview : styles.musePreview}`}>
              {isLayout && layoutPreviews.length > 0 ? layoutPreviews.map((preview, index) => <PreviewImage key={preview.src} {...preview} priority={index === 0} sheet />) :
                !isLayout && musePreviews.length === 3 ? <div className={styles.reel}>
                  {musePreviews.map(preview => <PreviewImage key={preview.src} {...preview} priority />)}
                </div> : <PreviewImage src={product.cover} alt={`${product.name}内容预览`} priority />}
            </div>
            <div className={styles.productHeading}>
              <h2>{product.name}</h2>
              <span className={buttonClassName({ className: styles.enter })}>开始浏览<ArrowUpRight size={18} strokeWidth={1.5} aria-hidden /></span>
            </div>
            <p className={styles.purpose}>{isLayout ? '排版与构图图鉴' : '图片与动效参考'}</p>
          </Link>
        </article>;
      })}
      {products.length === 0 && <p className={styles.empty}>产品正在整理中，稍后再来看看。</p>}
    </div>

  </main>;
}
