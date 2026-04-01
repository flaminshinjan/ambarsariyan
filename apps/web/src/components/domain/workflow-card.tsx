'use client';

import { useRouter } from 'next/navigation';
import type { IWorkflow } from '@ambarsariyan/shared';
import { Card, Icon } from '@/components/ui';
import styles from './workflow-card.module.css';

interface WorkflowCardProps {
  workflow: IWorkflow;
  onRun?: () => void;
}

const MAX_VISIBLE_TASKS = 3;

export function WorkflowCard({ workflow, onRun }: WorkflowCardProps) {
  const router = useRouter();
  const visibleTasks = workflow.tasks.slice(0, MAX_VISIBLE_TASKS);
  const remaining = workflow.tasks.length - MAX_VISIBLE_TASKS;

  return (
    <Card
      hoverable
      padding="none"
      onClick={() => router.push(`/workflows/${workflow.id}`)}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.name}>{workflow.name}</h3>
        </div>

        {workflow.description && (
          <p className={styles.description}>{workflow.description}</p>
        )}

        <div className={styles.taskPills}>
          {visibleTasks.map((wt) => (
            <span key={wt.id} className={styles.pill}>
              {wt.task?.name || `Task ${wt.sequence}`}
            </span>
          ))}
          {remaining > 0 && (
            <span className={styles.pillMore}>+{remaining} more</span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.taskCount}>
              <Icon name="account_tree" size={14} />
              {workflow.tasks.length} tasks
            </span>
            <span className={styles.date}>
              {new Date(workflow.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <button
            className={styles.runBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRun?.();
            }}
          >
            <Icon name="play_arrow" size={16} />
            Run
          </button>
        </div>
      </div>
    </Card>
  );
}
