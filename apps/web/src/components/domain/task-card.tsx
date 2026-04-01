'use client';

import type { ITask } from '@ambarsariyan/shared';
import { TaskCategory } from '@ambarsariyan/shared';
import { Card, Badge, Icon } from '@/components/ui';
import styles from './task-card.module.css';

interface TaskCardProps {
  task: ITask;
  onClick?: () => void;
}

const categoryConfig: Record<TaskCategory, { icon: string; className: string }> = {
  [TaskCategory.GMAIL]: { icon: 'mail', className: 'gmail' },
  [TaskCategory.HTTP]: { icon: 'language', className: 'http' },
  [TaskCategory.CUSTOM]: { icon: 'build', className: 'custom' },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const config = categoryConfig[task.category] ?? categoryConfig[TaskCategory.CUSTOM];

  return (
    <Card hoverable padding="none" onClick={onClick}>
      <div className={`${styles.card} ${styles[config.className]}`}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={`${styles.iconCircle} ${styles[`icon-${config.className}`]}`}>
              <Icon name={config.icon} size={18} />
            </div>
            <div className={styles.meta}>
              <h3 className={styles.name}>{task.name}</h3>
              {task.description && (
                <p className={styles.description}>{task.description}</p>
              )}
            </div>
          </div>
          <div className={styles.bottom}>
            <code className={styles.handler}>{task.handler}</code>
            <Badge variant={task.type === 'builtin' ? 'success' : 'warning'} size="sm">
              {task.type}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
