'use client';

import { useRef, useState } from 'react';

export interface CarouselMedia {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster: string | null;
  width: number | null;
  height: number | null;
  alt: string;
}

/**
 * 详情媒体区：横向 scroll-snap 轮播，媒体 contain 居中；
 * 视频静音自动循环播放，多媒体时右下显示 n/m 计数。
 */
export function MuseMediaCarousel({ media }: { media: CarouselMedia[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="relative w-full lg:h-full">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:h-full [&::-webkit-scrollbar]:hidden"
      >
        {media.map((m, index) => (
          <figure
            key={m.id}
            className="flex h-auto min-w-full snap-center items-center justify-center px-4 py-6 sm:px-8 sm:py-8 md:px-10 lg:h-full"
          >
            {m.type === 'video' ? (
              <video
                src={m.src}
                poster={m.poster ?? undefined}
                aria-label={m.alt}
                autoPlay={index === 0}
                muted
                loop
                playsInline
                controls={false}
                preload={index === 0 ? 'auto' : 'metadata'}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                className="max-h-[75dvh] max-w-full object-contain lg:max-h-full"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- contain 展示原始比例，不走优化管线
              <img
                src={m.src}
                alt={m.alt}
                draggable={false}
                className="max-h-[75dvh] max-w-full object-contain lg:max-h-full"
              />
            )}
          </figure>
        ))}
      </div>

      {media.length > 1 ? (
        <span className="absolute right-3 bottom-3 bg-ink px-1.5 py-0.5 font-mono text-[11.5px] text-paper">
          {current + 1} / {media.length}
        </span>
      ) : null}
    </div>
  );
}
