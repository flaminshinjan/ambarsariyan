'use client';

import type { ITask } from '@ambarsariyan/shared';
import { Card, Badge } from '@/components/ui';
import styles from './task-card.module.css';

interface TaskCardProps {
  task: ITask;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card hoverable padding="md" onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.name}>{task.name}</h3>
        <div className={styles.badges}>
          <Badge variant="info">{task.category}</Badge>
          <Badge variant={task.type === 'builtin' ? 'success' : 'default'}>{task.type}</Badge>
        </div>
      </div>
      {task.description && <p className={styles.description}>{task.description}</p>}
      <div className={styles.handler}>
        <span className={styles.handlerLabel}>Handler</span>
        <code className={styles.handlerValue}>{task.handler}</code>
      </div>
    </Card>
  );
}
