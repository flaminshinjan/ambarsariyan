'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import styles from './shell.module.css';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
