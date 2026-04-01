'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, Icon } from '@/components/ui';
import { LogViewer } from '@/components/domain/log-viewer';
import { useLogStore } from '@/stores/log.store';
import styles from './page.module.css';

export default function LogsPage() {
  const { stats, fetchStats } = useLogStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statItems = [
    { level: 'info', icon: 'info', count: stats.info || 0, cls: styles.info },
    { level: 'warn', icon: 'warning', count: stats.warn || 0, cls: styles.warn },
    { level: 'error', icon: 'error', count: stats.error || 0, cls: styles.error },
    { level: 'debug', icon: 'bug_report', count: stats.debug || 0, cls: styles.debug },
  ];

  return (
    <div>
      <Header title="Execution Logs" subtitle="Monitor system events and errors" />

      <div className={styles.statsBar}>
        {statItems.map((item) => (
          <Card key={item.level} padding="sm">
            <div className={styles.statItem}>
              <Icon name={item.icon} size={20} className={styles.statIcon} />
              <span className={`${styles.statCount} ${item.cls}`}>{item.count}</span>
              <span className={styles.statLevel}>{item.level}</span>
            </div>
          </Card>
        ))}
      </div>

      <LogViewer />
    </div>
  );
}
