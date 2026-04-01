'use client';

import { useRouter } from 'next/navigation';
import type { IWorkflow } from '@ambarsariyan/shared';
import { Card, Badge, Button } from '@/components/ui';
import styles from './workflow-card.module.css';

interface WorkflowCardProps {
  workflow: IWorkflow;
  onRun?: () => void;
}

export function WorkflowCard({ workflow, onRun }: WorkflowCardProps) {
  const router = useRouter();

  return (
    <Card
      hoverable
      padding="md"
      onClick={() => router.push(`/workflows/${workflow.id}`)}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{workflow.name}</h3>
        <Badge variant="info">{workflow.tasks.length} tasks</Badge>
      </div>
      {workflow.description && (
        <p className={styles.description}>{workflow.description}</p>
      )}
      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date(workflow.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <Button
          size="sm"
          variant="primary"
          icon="play_arrow"
          onClick={(e) => {
            e.stopPropagation();
            onRun?.();
          }}
        >
          Run
        </Button>
      </div>
    </Card>
  );
}
