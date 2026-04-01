'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui';
import { WorkflowCard } from '@/components/domain/workflow-card';
import { useWorkflowStore } from '@/stores/workflow.store';
import styles from './page.module.css';

export default function WorkflowsPage() {
  const { workflows, fetchWorkflows, runWorkflow } = useWorkflowStore();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return (
    <div>
      <Header title="Workflows" subtitle="Build and manage automation workflows">
        <Link href="/workflows/new">
          <Button variant="primary" icon="add">
            Create Workflow
          </Button>
        </Link>
      </Header>

      <div className={styles.grid}>
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onRun={() => runWorkflow(workflow.id)}
          />
        ))}
      </div>

      {workflows.length === 0 && (
        <div className={styles.empty}>
          <p>No workflows created yet</p>
        </div>
      )}
    </div>
  );
}
