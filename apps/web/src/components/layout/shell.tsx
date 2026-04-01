'use client';

import type { ReactNode } from 'react';
import { Icon, ToastContainer } from '@/components/ui';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Sidebar } from './sidebar';
import styles from './shell.module.css';

export function Shell({ children }: { children: ReactNode }) {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div className={styles.shell}>
      <button className={styles.menuButton} onClick={toggle} aria-label="Toggle sidebar">
        <Icon name={isOpen ? 'close' : 'menu'} size={20} />
      </button>
      <Sidebar />
      <main className={styles.main}>{children}</main>
      <ToastContainer />
    </div>
  );
}
