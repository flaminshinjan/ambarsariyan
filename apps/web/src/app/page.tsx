'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, Button, Badge, Icon } from '@/components/ui';
import { useTaskStore } from '@/stores/task.store';
import { useWorkflowStore } from '@/stores/workflow.store';
import { useLogStore } from '@/stores/log.store';
import styles from './page.module.css';

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { workflows, runs, fetchWorkflows, fetchRuns } = useWorkflowStore();
  const { stats, fetchStats } = useLogStore();

  useEffect(() => {
    fetchTasks();
    fetchWorkflows();
    fetchStats();
  }, [fetchTasks, fetchWorkflows, fetchStats]);

  useEffect(() => {
    if (workflows.length > 0) {
      workflows.forEach((w) => fetchRuns(w.id));
    }
  }, [workflows, fetchRuns]);

  const totalLogs = Object.values(stats).reduce((a, b) => a + b, 0);
  const recentRuns = runs.slice(0, 5);

  const statCards = [
    { label: 'Total Tasks', value: tasks.length, icon: 'task_alt', color: 'var(--accent)' },
    { label: 'Total Workflows', value: workflows.length, icon: 'account_tree', color: 'var(--success)' },
    { label: 'Recent Runs', value: runs.length, icon: 'play_circle', color: 'var(--warning)' },
    { label: 'Log Entries', value: totalLogs, icon: 'receipt_long', color: 'var(--error)' },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your automation system" />

      <div className={styles.stats}>
        {statCards.map((stat) => (
          <Card key={stat.label} padding="lg">
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: stat.color }}>
                <Icon name={stat.icon} size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Runs</h2>
          </div>
          {recentRuns.length === 0 ? (
            <Card padding="lg">
              <p className={styles.empty}>No workflow runs yet</p>
            </Card>
          ) : (
            <div className={styles.runList}>
              {recentRuns.map((run) => (
                <Card key={run.id} padding="sm">
                  <div className={styles.runItem}>
                    <div className={styles.runInfo}>
                      <span className={styles.runWorkflow}>
                        {run.workflow?.name || 'Workflow'}
                      </span>
                      <span className={styles.runTime}>
                        {new Date(run.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <Badge
                      variant={
                        run.status === 'completed'
                          ? 'success'
                          : run.status === 'failed'
                            ? 'error'
                            : run.status === 'running'
                              ? 'info'
                              : 'default'
                      }
                    >
                      {run.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
          </div>
          <div className={styles.quickActions}>
            <Link href="/workflows/new">
              <Button variant="primary" icon="add" size="lg">
                Create Workflow
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="secondary" icon="task_alt" size="lg">
                Browse Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
