'use client';

import type { IWorkflowRun } from '@ambarsariyan/shared';
import { WorkflowRunStatus, TaskRunStatus } from '@ambarsariyan/shared';
import { Badge, Icon } from '@/components/ui';
import styles from './run-status.module.css';

interface RunStatusProps {
  run: IWorkflowRun;
}

const statusVariant = (status: WorkflowRunStatus | TaskRunStatus) => {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'running':
      return 'info' as const;
    case 'failed':
      return 'error' as const;
    case 'pending':
      return 'default' as const;
    case 'skipped':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
};

const statusIcon = (status: WorkflowRunStatus | TaskRunStatus) => {
  switch (status) {
    case 'completed':
      return 'check_circle';
    case 'running':
      return 'pending';
    case 'failed':
      return 'error';
    case 'pending':
      return 'schedule';
    case 'skipped':
      return 'skip_next';
    default:
      return 'help';
  }
};

export function RunStatus({ run }: RunStatusProps) {
  const completedCount = run.taskRuns.filter(
    (tr) => tr.status === TaskRunStatus.COMPLETED
  ).length;
  const totalCount = run.taskRuns.length;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Badge variant={statusVariant(run.status)} size="md">
            {run.status}
          </Badge>
          <span className={styles.progress}>
            {completedCount}/{totalCount} tasks
          </span>
        </div>
        <span className={styles.time}>{formatTime(run.startedAt)}</span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          data-status={run.status}
        />
      </div>

      <div className={styles.taskRuns}>
        {run.taskRuns.map((tr) => (
          <div key={tr.id} className={styles.taskRun}>
            <Icon
              name={statusIcon(tr.status)}
              size={16}
              className={styles[`icon-${tr.status}`]}
            />
            <span className={styles.taskRunName}>
              {tr.task?.name || `Task ${tr.sequence}`}
            </span>
            <Badge variant={statusVariant(tr.status)} size="sm">
              {tr.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
