import type { HTMLAttributes } from 'react';
import styles from './card.module.css';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: CardPadding;
}

export function Card({ hoverable, padding = 'md', children, className, ...props }: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[`pad-${padding}`]} ${hoverable ? styles.hoverable : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
