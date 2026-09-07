'use client';

import { useEffect, useRef, type VideoHTMLAttributes } from 'react';

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & { src: string; active?: boolean };

/** Real motion previews: load near the viewport, play only while visible. */
export function MotionVideo({ active = true, src, onPause, ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let eligible = false;
    let manualPause = false;
    let disposed = false;
    const update = () => {
      eligible = active && visible && !document.hidden && !reduce.matches;
      if (eligible && !manualPause) {
        void video.play().then(() => { if (disposed || !eligible) video.pause(); }).catch(() => {});
      } else if (!eligible) video.pause();
    };
    const pause = () => { if (eligible && props.controls) manualPause = true; };
    const play = () => { manualPause = false; };
    const near = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && src && video.getAttribute('src') !== src) {
        video.src = src;
        video.load();
        near.disconnect();
      }
    }, { rootMargin: '160px' });
    const observer = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting && entry.intersectionRatio >= .3; update(); }, { threshold: .3 });
    near.observe(video);
    observer.observe(video);
    document.addEventListener('visibilitychange', update);
    reduce.addEventListener('change', update);
    video.addEventListener('canplay', update);
    video.addEventListener('pause', pause);
    video.addEventListener('play', play);
    return () => {
      disposed = true;
      eligible = false;
      near.disconnect(); observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      reduce.removeEventListener('change', update);
      video.removeEventListener('canplay', update);
      video.removeEventListener('pause', pause);
      video.removeEventListener('play', play);
      video.pause();
    };
  }, [active, src, props.controls]);
  return <video {...props} ref={ref} data-motion-video muted loop playsInline preload="metadata" onPause={onPause} />;
}
