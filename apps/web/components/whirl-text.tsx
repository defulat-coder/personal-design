'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './whirl-text.module.css';

/** One spatial reveal for the entire introduction, independent of line wrapping. */
export function WhirlIntro({ children }: {children:ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const wind = useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const element = ref.current;
    const gust = wind.current;
    if (!element || !gust) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation:Animation | undefined;
    let disposed = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      void document.fonts.ready.then(() => {
        if (disposed || reduced.matches) return;
        const bounds = element.getBoundingClientRect();
        const glyphs = Array.from(element.querySelectorAll<HTMLElement>('[data-letter]'));
        const points = glyphs.map(glyph => {
          const rect = glyph.getBoundingClientRect();
          return {x:rect.left-bounds.left+rect.width/2,y:rect.top-bounds.top+rect.height/2};
        });
        if (!points.length) return;
        const left = Math.min(...points.map(p=>p.x));
        const right = Math.max(...points.map(p=>p.x));
        const top = Math.min(...points.map(p=>p.y));
        const bottom = Math.max(...points.map(p=>p.y));
        const cx = (left+right)/2, cy = (top+bottom)/2;
        const rx = Math.max(60,(right-left)/2), ry = Math.max(40,(bottom-top)/2+16);
        // Reveal order follows angular/radial position, never DOM or line order.
        const delays = points.map(point => {
          const x = (point.x-cx)/rx, y = (point.y-cy)/ry;
          const angle = (Math.atan2(y,x)+Math.PI)/(Math.PI*2);
          return 650 + (angle*.65 + Math.min(1,Math.hypot(x,y))*.35)*3700;
        });
        const frames:Keyframe[] = Array.from({length:97},(_,index)=>{
          const t=index/96, phase=t*Math.PI*5-Math.PI/2;
          const radius=.3+.7*Math.sin(Math.PI*t*.85);
          return {offset:t,opacity:Math.min(1,t*7,(1-t)*7)*.5,transform:`translate3d(${cx+Math.cos(phase)*rx*radius-32}px,${cy+Math.sin(phase)*ry*radius-(1-t)*75-32}px,0) scale(${.08+Math.sin(t*Math.PI)*1.15})`};
        });
        glyphs.forEach((glyph,index)=>glyph.style.setProperty('--reveal-delay',`${delays[index]}ms`));
        setEntered(true);
        animation=gust.animate(frames,{duration:6200,fill:'both',easing:'linear'});
      });
    },{threshold:.5});
    observer.observe(element);
    const stop=()=>{if(reduced.matches) animation?.cancel();};
    reduced.addEventListener('change',stop);
    return ()=>{disposed=true;observer.disconnect();animation?.cancel();reduced.removeEventListener('change',stop);};
  },[]);
  return <div ref={ref} className={styles.intro} data-entered={entered}>
    {children}
    <span ref={wind} className={styles.wind} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth=".8">
        <path d="M7 16C7 7 58 7 58 17S12 29 10 19M15 27C15 18 51 18 51 28S20 38 18 29M24 38C24 30 43 30 43 39S29 48 29 41M33 47Q40 53 29 59"/>
        <path d="M4 27Q-1 21 5 17M56 32Q62 26 59 22M18 45Q13 41 15 36" opacity=".5"/>
      </svg>
    </span>
  </div>;
}

export function WhirlText({ children }: {children:string}) {
  return <span className={styles.text}>
    <span className={styles.accessible}>{children}</span>
    <span aria-hidden="true">{Array.from(children).map((letter,index)=><span key={index} data-letter className={styles.letter}>{letter===' '?'\u00a0':letter}</span>)}</span>
  </span>;
}
