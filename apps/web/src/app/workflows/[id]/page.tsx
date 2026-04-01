'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { WorkflowRunStatus } from '@ambarsariyan/shared';
import { Header } from '@/components/layout/header';
import { Button, Badge, Card, Icon } from '@/components/ui';
import { RunStatus } from '@/components/domain/run-status';
import { useWorkflowStore } from '@/stores/workflow.store';
import styles from './page.module.css';

export default function WorkflowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    currentWorkflow,
    currentRun,
    runs,
    loading,
    fetchWorkflow,
    fetchRuns,
    runWorkflow,
    pollRun,
  } = useWorkflowStore();

  useEffect(() => {
    fetchWorkflow(id);
    fetchRuns(id);
  }, [id, fetchWorkflow, fetchRuns]);

  const startPolling = useCallback(
    (runId: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        pollRun(runId);
      }, 2000);
    },
    [pollRun]
  );

  useEffect(() => {
    if (
      currentRun &&
      (currentRun.status === WorkflowRunStatus.PENDING ||
        currentRun.status === WorkflowRunStatus.RUNNING)
    ) {
      startPolling(currentRun.id);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      if (currentRun) {
        fetchRuns(id);
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentRun, startPolling, fetchRuns, id]);

  const handleRun = async () => {
    try {
      const run = await runWorkflow(id);
      startPolling(run.id);
    } catch {
      /* noop */
    }
  };

  if (!currentWorkflow && loading) {
    return (
      <div className={styles.loading}>Loading...</div>
    );
  }

  if (!currentWorkflow) return null;

  return (
    <div>
      <Header title={currentWorkflow.name} subtitle={currentWorkflow.description}>
        <Button variant="primary" icon="play_arrow" onClick={handleRun}>
          Run Workflow
        </Button>
      </Header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Task Sequence</h2>
          <div className={styles.taskSequence}>
            {currentWorkflow.tasks
              .sort((a, b) => a.sequence - b.sequence)
              .map((wt, index) => (
                <div key={wt.id} className={styles.taskStep}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepInfo}>
                    <span className={styles.stepName}>
                      {wt.task?.name || `Task ${wt.taskId}`}
                    </span>
                    {wt.task && (
                      <div className={styles.stepMeta}>
                        <Badge variant="info" size="sm">{wt.task.category}</Badge>
                        <code className={styles.stepHandler}>{wt.task.handler}</code>
                      </div>
                    )}
                  </div>
                  {index < currentWorkflow.tasks.length - 1 && (
                    <div className={styles.connector}>
                      <Icon name="arrow_downward" size={14} />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>

        {currentRun && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Active Run</h2>
            <RunStatus run={currentRun} />
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Run History</h2>
          {runs.length === 0 ? (
            <Card padding="lg">
              <p className={styles.empty}>No runs yet</p>
            </Card>
          ) : (
            <div className={styles.runHistory}>
              {runs.map((run) => (
                <RunStatus key={run.id} run={run} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
