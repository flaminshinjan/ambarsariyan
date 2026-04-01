'use client';

import { useEffect } from 'react';
import { LogLevel } from '@ambarsariyan/shared';
import { useLogStore } from '@/stores/log.store';
import { Select } from '@/components/ui';
import styles from './log-viewer.module.css';

const levelOptions = [
  { value: '', label: 'All Levels' },
  { value: LogLevel.INFO, label: 'Info' },
  { value: LogLevel.WARN, label: 'Warn' },
  { value: LogLevel.ERROR, label: 'Error' },
  { value: LogLevel.DEBUG, label: 'Debug' },
];

export function LogViewer() {
  const { logs, loading, query, fetchLogs, setQuery } = useLogStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, query]);

  const levelClass = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return styles.error;
      case LogLevel.WARN:
        return styles.warn;
      case LogLevel.INFO:
        return styles.info;
      case LogLevel.DEBUG:
        return styles.debug;
      default:
        return '';
    }
  };

  return (
    <div className={styles.viewer}>
      <div className={styles.filters}>
        <Select
          options={levelOptions}
          value={query.level || ''}
          onChange={(e) => setQuery({ level: (e.target.value || undefined) as LogLevel | undefined, page: 1 })}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Level</th>
              <th className={styles.th}>Timestamp</th>
              <th className={styles.th}>Context</th>
              <th className={styles.th}>Message</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className={styles.loading}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  No log entries found
                </td>
              </tr>
            )}
            {!loading &&
              logs.map((log) => (
                <tr key={log.id} className={`${styles.row} ${levelClass(log.level)}`}>
                  <td className={styles.td}>
                    <span className={`${styles.levelBadge} ${levelClass(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.timestamp}`}>
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className={`${styles.td} ${styles.context}`}>{log.context}</td>
                  <td className={styles.td}>{log.message}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={query.page === 1}
            onClick={() => setQuery({ page: (query.page || 1) - 1 })}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>Page {query.page || 1}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setQuery({ page: (query.page || 1) + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
