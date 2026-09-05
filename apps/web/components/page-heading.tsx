import type { ReactNode } from 'react';
import styles from './page-heading.module.css';

export function PageHeading({ title, description, meta, children }: { title: string; description: string; meta?: ReactNode; children?: ReactNode }) {
  return <header className={styles.heading}>
    <div className={styles.row}><h1>{title}</h1>{meta ? <div className={styles.meta}>{meta}</div> : null}</div>
    <p className={styles.description}>{description}</p>
    {children}
  </header>;
}
