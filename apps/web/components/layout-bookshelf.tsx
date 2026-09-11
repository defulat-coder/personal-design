'use client';

import Image from 'next/image';
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react';
import { categoryLabel } from '@/lib/category-label';
import { useLightbox } from './lifeline/lightbox';
import { instantMotion } from '@/lib/motion';
import { CollectionSearch } from './collection-search';
import { Button } from './button';
import { WorkspaceBack } from './workspace-shell';
import styles from './layout-bookshelf.module.css';

export interface BookPage { id:string; name:string; category:string; theme:string; themeSlug:string; thumb:string|null; src:string|null }
interface Props { categories:{ name:string; count:number }[]; items:BookPage[] }
const path = '/products/layout-compositions';
const bindings = [
  ['#b94a35','#fff6df',340,76], ['#d6c7a6','#342e25',292,68],
  ['#557477','#fff9e9',380,88], ['#d4ac49','#302918',324,74],
  ['#465676','#f7f3e9',360,82], ['#a65e47','#fff8ec',280,66],
  ['#707453','#fff9e5',350,78], ['#ddd5c3','#34312a',310,72],
] as const;
export function BookSpines({ categories, onOpen, muted = [], previewActive = -1 }: {previewActive?:number; categories:{name:string;count:number}[]; onOpen?:(name:string)=>void; muted?:string[]}) {
  return <div className={styles.shelf} data-preview={!onOpen || undefined}>
    <div className={styles.books}>{categories.map((category,index) => {
      const [color,ink,height,width] = bindings[index % bindings.length]!;
      const content = <Fragment key={category.name}><span className={styles.spineTitle}>{categoryLabel(category.name)}</span><span className={styles.spineBottom}>{String(index+1).padStart(2,'0')}<span>{category.count} 页</span></span></Fragment>;
      const props = {className:styles.spine, style:{'--binding':color,'--binding-ink':ink,'--book-height':`${height}px`,'--book-width':`${width}px`} as CSSProperties};
      return onOpen ? <button {...props} key={category.name} id={`book-${index}`} disabled={muted.includes(category.name)} aria-label={`打开${categoryLabel(category.name)}，${category.count}页`} onClick={()=>onOpen(category.name)}>{content}</button> : <span {...props} key={category.name} data-book-active={index === previewActive} data-cover-title={categoryLabel(category.name)}>{content}<span data-book-cover aria-hidden="true"><span>{categoryLabel(category.name)}</span><small>排版构图图鉴</small></span></span>;
    })}</div>
  </div>;
}

export function LayoutBookshelf({categories,items}:Props) {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const term = query.trim().toLocaleLowerCase();
  const theme = params.get('theme') || '';
  const active = categories.find(c=>c.name===params.get('cat'));
  const matches = items.filter(item=>(!theme || item.themeSlug===theme) && (!term || `${item.id} ${item.name} ${item.category} ${categoryLabel(item.category)} ${item.theme}`.toLocaleLowerCase().includes(term)));
  const pages = active ? matches.filter(item=>item.category===active.name) : [];
  const lastBook = useRef(0);
  const shelfScroll = useRef(0);
  function update(values:Record<string,string>, push=false) {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key,value])=>value ? next.set(key,value) : next.delete(key));
    window.history[push ? 'pushState' : 'replaceState'](null,'',`${path}${next.size ? `?${next}`:''}`);
  }
  function open(name:string,id='') {
    shelfScroll.current = window.scrollY;
    window.scrollTo({top:0,behavior:'instant'});
    lastBook.current = categories.findIndex(c=>c.name===name);
    update({cat:name,page:id},true);
  }
  const close = useCallback(() => {
    const next = new URLSearchParams(window.location.search);
    next.delete('cat');
    next.delete('page');
    window.history.replaceState(null,'',`${path}${next.size ? `?${next}`:''}`);
    requestAnimationFrame(()=>{document.getElementById(`book-${active ? categories.indexOf(active) : lastBook.current}`)?.focus({preventScroll:true});window.scrollTo({top:shelfScroll.current,behavior:'instant'});});
  }, [active, categories]);
  return <div className={styles.library} data-search={!!term || !!theme || undefined}>
    {active ? <WorkspaceBack label="返回书架" onBack={close} /> : <div className={styles.toolbar}>
      <span className={styles.collectionName}>排版构图图鉴</span>
      <CollectionSearch value={query} onChange={q=>update({q,cat:'',page:''})} placeholder="搜索图鉴" label="搜索图鉴" />
    </div>}
    {active && pages.length ? <BookReader key={`${active.name}:${query}:${theme}`} name={active.name} pages={pages} initialId={params.get('page') || ''} onPage={id=>update({page:id})} onClose={close} /> : <>
      <BookSpines categories={categories} onOpen={open} muted={categories.filter(c=>!matches.some(item=>item.category===c.name)).map(c=>c.name)} />
      {term || theme ? <section className={styles.results} aria-label="搜索结果">
        <div className={styles.resultHeading}><p role="status">{matches.length} 条图鉴</p><Button variant="ghost" onClick={()=>update({q:'',theme:'',cat:'',page:''})}>清除筛选</Button></div>
        {matches.length ? <div className={styles.matchList}>{matches.map(item=><button key={item.id} onClick={()=>open(item.category,item.id)}><span>{item.name}<small>{categoryLabel(item.category)} · {item.theme}</small></span><ArrowRight size={18} strokeWidth={1.6} aria-hidden/></button>)}</div> : <p>没有找到匹配的图鉴，试试其他关键词。</p>}
      </section> : <p className={styles.hint}>选一本，翻开看看。</p>}
    </>}
  </div>;
}

function BookReader({name,pages,initialId,onPage,onClose}:{name:string;pages:BookPage[];initialId:string;onPage:(id:string)=>void;onClose:()=>void}) {
  const initial = Math.max(0,pages.findIndex(page=>page.id===initialId));
  const [spread,setSpread] = useState(Math.floor(initial/2)*2);
  const [turn,setTurn] = useState<{from:number;to:number;direction:number}|null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reader = useRef<HTMLDivElement>(null);
  const pointer = useRef<number|null>(null);
  const swiped = useRef(false);
  useEffect(()=>{reader.current?.focus({preventScroll:true}); return ()=>clearTimeout(timer.current);},[]);
  function go(direction:number) {
    if (turn) return;
    const next = spread+direction*2;
    if(next<0 || next>=pages.length) return;
    onPage(pages[next]!.id);
    if(instantMotion()) {setSpread(next); return;}
    setTurn({from:spread,to:next,direction});
    timer.current = setTimeout(()=>{setSpread(next);setTurn(null);},680);
  }
  const left = turn?.direction===-1 ? turn.to : spread;
  const right = turn?.direction===1 ? turn.to+1 : spread+1;
  return <div ref={reader} className={styles.reader} tabIndex={-1} aria-label={`${categoryLabel(name)}画册`} onKeyDown={event=>{
    if(event.target instanceof HTMLElement && event.target.closest('input,textarea,select')) return;
    if(event.key==='ArrowRight' || event.key==='ArrowLeft') {event.preventDefault();go(event.key==='ArrowRight'?1:-1);}
    if(event.key==='Escape') {event.preventDefault();onClose();}
  }}>
    <div className={styles.readerHeading}><h2>{categoryLabel(name)}</h2><p className={styles.pageCount} role="status" aria-label={`第${spread+1}至${Math.min(spread+2,pages.length)}页，共${pages.length}页`}>{spread+1}{spread+1 < pages.length ? `–${Math.min(spread+2,pages.length)}` : ''}<span> / {pages.length}</span></p></div>
    <div className={styles.bookStage} onClickCapture={event=>{if(swiped.current){event.preventDefault();event.stopPropagation();swiped.current=false;}}} onPointerDown={event=>{swiped.current=false;if(event.pointerType==='touch') pointer.current=event.clientX;}} onPointerUp={event=>{
      if(pointer.current!==null && Math.abs(event.clientX-pointer.current)>60) {swiped.current=true;go(event.clientX<pointer.current?1:-1);event.preventDefault();}
      pointer.current=null;
    }} onPointerCancel={()=>{pointer.current=null;}}>
      <div className={styles.spread}>
        <div className={`${styles.page} ${styles.left}`}><PageContent key={pages[left]?.id ?? 'end-left'} item={pages[left]}/></div>
        <div className={`${styles.page} ${styles.right}`}><PageContent key={pages[right]?.id ?? 'end-right'} item={pages[right]}/></div>
        {turn && <div className={`${styles.leaf} ${turn.direction===1?styles.forward:styles.backward}`} aria-hidden inert>
          <div className={`${styles.face} ${styles.front}`}><PageContent item={pages[turn.direction===1?turn.from+1:turn.from]}/></div>
          <div className={`${styles.face} ${styles.back}`}><PageContent item={pages[turn.direction===1?turn.to:turn.to+1]}/></div>
        </div>}
      </div>
      <nav className={styles.pagination} aria-label="画册翻页"><Button icon data-direction="previous" disabled={spread===0 || !!turn} onClick={()=>go(-1)} aria-label="上一页"><ArrowLeft aria-hidden/></Button><Button icon data-direction="next" disabled={spread+2>=pages.length || !!turn} onClick={()=>go(1)} aria-label="下一页"><ArrowRight aria-hidden/></Button></nav>
    </div>
  </div>;
}

function PageContent({item}:{item?:BookPage}) {
  const [failed,setFailed] = useState(false);
  const lightbox = useLightbox();
  if(!item) return <div className={styles.endPage}>本册已阅毕</div>;
  return <button className={styles.pageImage} aria-label={`放大${item.name}`} disabled={!item.src} onClick={event=>{
    if(item.src) lightbox?.open({src:item.src,thumb:item.thumb ?? undefined,alt:item.name},{rect:event.currentTarget.getBoundingClientRect(),sourceEl:event.currentTarget});
  }}>
    {item.thumb && !failed ? <Image src={item.thumb} alt={item.name} fill unoptimized sizes="(max-width: 640px) 44vw, 440px" draggable={false} onError={()=>setFailed(true)}/> : <span>{item.name}<br/>{failed?'图片暂时无法加载':'此图鉴暂缺图片'}</span>}
    {item.src && <span className={styles.zoomHint}><Maximize2 size={14}/>放大查看</span>}
  </button>;
}
