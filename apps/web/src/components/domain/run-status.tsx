'use client';

import type { IWorkflowRun } from '@ambarsariyan/shared';
import { WorkflowRunStatus, TaskRunStatus } from '@ambarsariyan/shared';
import { Icon } from '@/components/ui';
import styles from './run-status.module.css';

interface RunStatusProps {
  run: IWorkflowRun;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'completed' },
  running: { label: 'Running', className: 'running' },
  failed: { label: 'Failed', className: 'failed' },
  pending: { label: 'Pending', className: 'pending' },
  skipped: { label: 'Skipped', className: 'skipped' },
};

const taskIcon = (status: TaskRunStatus) => {
  switch (status) {
    case TaskRunStatus.COMPLETED:
      return 'check_circle';
    case TaskRunStatus.RUNNING:
      return 'autorenew';
    case TaskRunStatus.FAILED:
      return 'error_outline';
    case TaskRunStatus.PENDING:
      return 'circle';
    case TaskRunStatus.SKIPPED:
      return 'skip_next';
    default:
      return 'circle';
  }
};

const formatDuration = (start: string | null, end: string | null): string => {
  if (!start) return '\u2014';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const ms = e - s;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

export function RunStatus({ run }: RunStatusProps) {
  const completedCount = run.taskRuns.filter(
    (tr) => tr.status === TaskRunStatus.COMPLETED
  ).length;
  const totalCount = run.taskRuns.length;
  const config = statusConfig[run.status] ?? statusConfig.pending;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.statusBadge} ${styles[config.className]}`}>
          {config.label}
        </div>
        <span className={styles.progressText}>
          {completedCount}/{totalCount} tasks
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={`${styles.progressFill} ${styles[`fill-${config.className}`]}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className={styles.taskList}>
        {run.taskRuns.map((tr, idx) => {
          const trConfig = statusConfig[tr.status] ?? statusConfig.pending;
          return (
            <div key={tr.id} className={styles.taskRow}>
              <span className={styles.seq}>{idx + 1}</span>
              <span className={styles.taskName}>
                {tr.task?.name || `Task ${tr.sequence}`}
              </span>
              <span className={styles.duration}>
                {formatDuration(tr.startedAt, tr.completedAt)}
              </span>
              <span className={`${styles.statusIcon} ${styles[`icon-${trConfig.className}`]}`}>
                <Icon
                  name={taskIcon(tr.status)}
                  size={16}
                  className={tr.status === TaskRunStatus.RUNNING ? styles.spin : undefined}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
