'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import styles from './collection-search.module.css';

export function CollectionSearch({ value, onChange, placeholder, label }: {
  value:string;
  onChange:(value:string) => void;
  placeholder:string;
  label:string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus());
  };
  useEffect(() => {
    if (open) input.current?.focus({ preventScroll:true });
  }, [open]);
  useEffect(() => {
    const focusSearch = (event:KeyboardEvent) => {
      if (event.key !== '/' || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input,textarea,select,[role=textbox]'))) return;
      event.preventDefault();
      setOpen(true);
      input.current?.focus({ preventScroll:true });
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event:PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  return <div ref={root} className={styles.shell} data-open={open}
    onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-label={value ? `编辑搜索：${value}` : `打开${placeholder}`} aria-expanded={open} aria-controls={panelId} aria-keyshortcuts="/" onClick={() => setOpen(true)}>
      <Search size={18} strokeWidth={1.6} aria-hidden /><span className={styles.query}>{value || '搜索'}</span>
      {value ? <span className={styles.dot} aria-hidden /> : <kbd className={styles.shortcut} aria-hidden>/</kbd>}
    </button>
    <form id={panelId} hidden={!open} role="search" aria-label={label} className={styles.panel} onSubmit={event => { event.preventDefault(); close(true); }}
      onKeyDown={event => {
        if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }}>
      <Search className={styles.icon} size={20} strokeWidth={1.6} aria-hidden />
      <input ref={input} type="search" aria-label={label} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />
      {value ? <button type="button" className={styles.clear} aria-label="清除搜索" onClick={() => { onChange(''); input.current?.focus(); }}><X size={16} aria-hidden /></button> : null}
      <button type="submit" className={styles.done} aria-label="收起搜索，浏览结果" title="收起搜索，浏览结果"><ArrowRight size={18} aria-hidden /></button>
    </form>
  </div>;
}
