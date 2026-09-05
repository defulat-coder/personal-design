'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { buttonClassName } from './button';
import styles from './raw-json-details.module.css';
import { FileJson } from 'lucide-react';

/**
 * 「同步的原始 JSON」浮层：Esc / 点击外部关闭。
 * summary 本身键盘可用（Space/Enter 开合），这里补浮层语义的两个关闭通道。
 */
export function RawJsonDetails({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        rootRef.current?.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <details
      ref={rootRef}
      className={styles.root}
      onKeyDown={(event) => { if (open && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) event.stopPropagation(); }}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className={buttonClassName({ variant: 'ghost', className: styles.trigger })}>
        <FileJson className="size-3.5" />
        同步的原始 JSON
      </summary>
      {children}
    </details>
  );
}
