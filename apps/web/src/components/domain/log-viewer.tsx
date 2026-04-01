'use client';

import { useEffect } from 'react';
import { LogLevel } from '@ambarsariyan/shared';
import { useLogStore } from '@/stores/log.store';
import { Select, Input } from '@/components/ui';
import styles from './log-viewer.module.css';

const levelOptions = [
  { value: '', label: 'All Levels' },
  { value: LogLevel.INFO, label: 'Info' },
  { value: LogLevel.WARN, label: 'Warn' },
  { value: LogLevel.ERROR, label: 'Error' },
  { value: LogLevel.DEBUG, label: 'Debug' },
];

const levelDotClass: Record<string, string> = {
  info: 'dotInfo',
  warn: 'dotWarn',
  error: 'dotError',
  debug: 'dotDebug',
};

export function LogViewer() {
  const { logs, loading, query, fetchLogs, setQuery } = useLogStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, query]);

  return (
    <div className={styles.viewer}>
      <div className={styles.filters}>
        <Select
          options={levelOptions}
          value={query.level || ''}
          onChange={(e) =>
            setQuery({
              level: (e.target.value || undefined) as LogLevel | undefined,
              page: 1,
            })
          }
        />
        <Input
          placeholder="Search messages..."
          icon="search"
          value={query.context || ''}
          onChange={(e) => setQuery({ context: e.target.value || undefined, page: 1 })}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} style={{ width: 80 }}>Level</th>
              <th className={styles.th} style={{ width: 160 }}>Timestamp</th>
              <th className={styles.th} style={{ width: 140 }}>Context</th>
              <th className={styles.th}>Message</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className={styles.placeholder}>Loading...</td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.placeholder}>No log entries found</td>
              </tr>
            )}
            {!loading &&
              logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className={`${styles.row} ${idx % 2 === 1 ? styles.rowAlt : ''}`}
                >
                  <td className={styles.td}>
                    <span className={styles.level}>
                      <span className={`${styles.dot} ${styles[levelDotClass[log.level] ?? 'dotDebug']}`} />
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
                  <td className={styles.td}>
                    <span className={styles.context}>{log.context}</span>
                  </td>
                  <td className={`${styles.td} ${styles.message}`}>{log.message}</td>
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
