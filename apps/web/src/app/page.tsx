'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon, Badge } from '@/components/ui';
import { useTaskStore } from '@/stores/task.store';
import { useWorkflowStore } from '@/stores/workflow.store';
import { useLogStore } from '@/stores/log.store';
import { useThemeStore } from '@/stores/theme.store';
import { useToastStore } from '@/stores/toast.store';
import { api } from '@/lib/api';
import { TaskCategory } from '@ambarsariyan/shared';
import type { ILogEntry } from '@ambarsariyan/shared';
import styles from './page.module.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function formatRelativeTime(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function categoryAccent(cat: TaskCategory) {
  if (cat === TaskCategory.GMAIL) return styles.catGmail;
  if (cat === TaskCategory.HTTP) return styles.catHttp;
  return styles.catCustom;
}

const TASK_ICONS: Record<string, string> = {
  read_gmail: 'inbox',
  send_gmail: 'forward_to_inbox',
  gmail_morning_pulse: 'wb_sunny',
  custom_http: 'language',
};

function taskIcon(handler: string) {
  return TASK_ICONS[handler] || 'extension';
}

function statusDot(status: string) {
  if (status === 'completed') return styles.dotCompleted;
  if (status === 'failed') return styles.dotFailed;
  if (status === 'running') return styles.dotRunning;
  return styles.dotPending;
}

function logLevelClass(level: string) {
  if (level === 'error') return styles.lvlError;
  if (level === 'warn') return styles.lvlWarn;
  if (level === 'debug') return styles.lvlDebug;
  return styles.lvlInfo;
}

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { workflows, runs, fetchWorkflows, fetchRuns, runWorkflow } = useWorkflowStore();
  const { logs, stats, fetchLogs, fetchStats } = useLogStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const addToast = useToastStore((s) => s.add);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTasks();
    fetchWorkflows();
    fetchStats();
    fetchLogs();
  }, [fetchTasks, fetchWorkflows, fetchStats, fetchLogs]);

  useEffect(() => {
    if (workflows.length > 0) {
      workflows.forEach((w) => fetchRuns(w.id));
    }
  }, [workflows, fetchRuns]);

  useEffect(() => {
    api
      .get<{ connected: boolean; email?: string }>('/auth/google/status')
      .then((res) => {
        setGmailConnected(res.connected);
        if (res.email) setGmailEmail(res.email);
      })
      .catch(() => setGmailConnected(false));
  }, []);

  const handleRun = useCallback(
    async (id: string, name: string) => {
      setRunningIds((prev) => new Set(prev).add(id));
      addToast(`Workflow "${name}" is running...`, 'info', 'rocket_launch');
      try {
        const run = await runWorkflow(id);
        addToast(`Workflow "${name}" started successfully`, 'success', 'check_circle');
        setTimeout(() => {
          fetchRuns(id);
          fetchLogs();
          fetchStats();
        }, 3000);
        return run;
      } catch {
        addToast(`Failed to start "${name}"`, 'error', 'error');
      } finally {
        setRunningIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [runWorkflow, addToast, fetchRuns, fetchLogs, fetchStats],
  );

  const totalLogs = Object.values(stats).reduce((a, b) => a + b, 0);
  const recentRuns = runs.slice(0, 6);
  const recentLogs = logs.slice(0, 8);

  const dateStr = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );

  const timeStr = useMemo(
    () =>
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    [],
  );

  const completedRuns = runs.filter((r) => r.status === 'completed').length;
  const failedRuns = runs.filter((r) => r.status === 'failed').length;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTime}>{timeStr}</span>
            <h1 className={styles.heroGreeting}>{getGreeting()}</h1>
            <span className={styles.heroDate}>{dateStr}</span>
          </div>
          <div className={styles.heroRight}>
            <div className={`${styles.statusChip} ${gmailConnected ? styles.statusOn : styles.statusOff}`}>
              <span className={styles.statusDotInner} />
              <span className={styles.statusLabel}>
                {gmailConnected ? gmailEmail || 'Gmail Connected' : 'Gmail Disconnected'}
              </span>
            </div>
            <button className={styles.themeBtn} onClick={toggleTheme}>
              <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Tasks', value: tasks.length, icon: 'task_alt', color: 'accent' },
          { label: 'Workflows', value: workflows.length, icon: 'account_tree', color: 'success' },
          { label: 'Completed', value: completedRuns, icon: 'check_circle', color: 'info' },
          { label: 'Failed', value: failedRuns, icon: 'cancel', color: 'error' },
          { label: 'Total Runs', value: runs.length, icon: 'play_circle', color: 'warning' },
          { label: 'Log Entries', value: totalLogs, icon: 'receipt_long', color: 'accent' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={`${styles.statCardIcon} ${styles[s.color]}`}>
              <Icon name={s.icon} size={20} />
            </div>
            <div className={styles.statCardText}>
              <span className={styles.statCardValue}>{s.value}</span>
              <span className={styles.statCardLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        <Link href="/workflows/new" className={`${styles.ctaCard} ${styles.ctaAccent}`}>
          <div className={styles.ctaIcon}>
            <Icon name="bolt" size={28} />
          </div>
          <div className={styles.ctaText}>
            <span className={styles.ctaTitle}>Create Workflow</span>
            <span className={styles.ctaSub}>Build a new automation pipeline from your tasks</span>
          </div>
          <Icon name="arrow_forward" size={20} className={styles.ctaArrow} />
        </Link>
        <Link href="/settings" className={`${styles.ctaCard} ${styles.ctaGmail}`}>
          <div className={styles.ctaIcon}>
            <Icon name="mail" size={28} />
          </div>
          <div className={styles.ctaText}>
            <span className={styles.ctaTitle}>
              {gmailConnected ? 'Gmail Connected' : 'Connect Gmail'}
            </span>
            <span className={styles.ctaSub}>
              {gmailConnected
                ? 'Your inbox is linked and ready for automation'
                : 'Link your Google account to enable email tasks'}
            </span>
          </div>
          <Icon name="arrow_forward" size={20} className={styles.ctaArrow} />
        </Link>
        <div
          className={`${styles.ctaCard} ${styles.ctaPulse}`}
          onClick={() => {
            const pulseWf = workflows.find((w) =>
              w.name.toLowerCase().includes('pulse') || w.name.toLowerCase().includes('morning'),
            );
            if (pulseWf) {
              handleRun(pulseWf.id, pulseWf.name);
            } else {
              addToast('Create a Morning Pulse workflow first', 'warning', 'info');
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={styles.ctaIcon}>
            <Icon name="wb_sunny" size={28} />
          </div>
          <div className={styles.ctaText}>
            <span className={styles.ctaTitle}>Morning Pulse</span>
            <span className={styles.ctaSub}>Run your daily email briefing right now</span>
          </div>
          <Icon name="play_arrow" size={20} className={styles.ctaArrow} />
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadLeft}>
              <Icon name="task_alt" size={16} className={styles.panelHeadIcon} />
              <span className={styles.panelTitle}>Tasks</span>
              <span className={styles.badge}>{tasks.length}</span>
            </div>
            <Link href="/tasks" className={styles.panelAction}>
              <Icon name="add" size={14} />
            </Link>
          </div>
          <div className={styles.panelBody}>
            {tasks.length === 0 ? (
              <div className={styles.emptySmall}>
                No tasks yet &middot;{' '}
                <Link href="/tasks" className={styles.emptyLink}>Add one</Link>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`${styles.taskCard} ${categoryAccent(task.category)}`}>
                  <div className={`${styles.taskIconWrap} ${categoryAccent(task.category)}`}>
                    <Icon name={taskIcon(task.handler)} size={18} />
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTopRow}>
                      <span className={styles.taskName}>{task.name}</span>
                      <Badge
                        variant={
                          task.category === TaskCategory.GMAIL
                            ? 'warning'
                            : task.category === TaskCategory.HTTP
                              ? 'info'
                              : 'default'
                        }
                        size="sm"
                      >
                        {task.category}
                      </Badge>
                    </div>
                    {task.description && (
                      <span className={styles.taskDesc}>{task.description}</span>
                    )}
                    <span className={styles.taskHandler}>{task.handler}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadLeft}>
              <Icon name="account_tree" size={16} className={styles.panelHeadIcon} />
              <span className={styles.panelTitle}>Workflows</span>
              <span className={styles.badge}>{workflows.length}</span>
            </div>
            <Link href="/workflows/new" className={styles.panelAction}>
              <Icon name="add" size={14} />
            </Link>
          </div>
          <div className={styles.panelBody}>
            {workflows.length === 0 ? (
              <div className={styles.emptySmall}>
                No workflows &middot;{' '}
                <Link href="/workflows/new" className={styles.emptyLink}>Create one</Link>
              </div>
            ) : (
              workflows.map((wf) => (
                <div key={wf.id} className={styles.wfCard}>
                  <div className={styles.wfRow}>
                    <span className={styles.wfName}>{wf.name}</span>
                    <span className={styles.wfPill}>{wf.tasks.length} task{wf.tasks.length !== 1 ? 's' : ''}</span>
                  </div>
                  {wf.description && <p className={styles.wfDesc}>{wf.description}</p>}
                  <div className={styles.wfActions}>
                    <button
                      className={styles.runBtn}
                      onClick={() => handleRun(wf.id, wf.name)}
                      disabled={runningIds.has(wf.id)}
                    >
                      {runningIds.has(wf.id) ? (
                        <>
                          <Icon name="progress_activity" size={12} className={styles.spinner} />
                          Running
                        </>
                      ) : (
                        <>
                          <Icon name="play_arrow" size={14} />
                          Run
                        </>
                      )}
                    </button>
                    <Link href={`/workflows`} className={styles.viewLink}>View</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadLeft}>
              <Icon name="timeline" size={16} className={styles.panelHeadIcon} />
              <span className={styles.panelTitle}>Recent Runs</span>
            </div>
          </div>
          <div className={styles.panelBody}>
            {recentRuns.length === 0 ? (
              <div className={styles.emptySmall}>No runs yet</div>
            ) : (
              recentRuns.map((run) => (
                <div key={run.id} className={styles.runRow}>
                  <span className={`${styles.runDot} ${statusDot(run.status)}`} />
                  <div className={styles.runInfo}>
                    <span className={styles.runName}>{run.workflow?.name || 'Workflow'}</span>
                    <span className={styles.runTime}>{formatRelativeTime(run.createdAt)}</span>
                  </div>
                  <span className={`${styles.runStatus} ${statusDot(run.status)}`}>{run.status}</span>
                </div>
              ))
            )}
          </div>
          <div className={styles.logStrip}>
            <div className={styles.logStripHead}>
              <span className={styles.logStripTitle}>Log Summary</span>
              <Link href="/logs" className={styles.viewAllLink}>View all &rarr;</Link>
            </div>
            <div className={styles.logStripPills}>
              <span className={`${styles.logPill} ${styles.pillInfo}`}>{stats.info || 0} info</span>
              <span className={`${styles.logPill} ${styles.pillWarn}`}>{stats.warn || 0} warn</span>
              <span className={`${styles.logPill} ${styles.pillError}`}>{stats.error || 0} error</span>
              <span className={`${styles.logPill} ${styles.pillDebug}`}>{stats.debug || 0} debug</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.logsPanel}>
        <div className={styles.logsPanelHead}>
          <div className={styles.panelHeadLeft}>
            <Icon name="receipt_long" size={16} className={styles.panelHeadIcon} />
            <span className={styles.panelTitle}>Live Logs</span>
            <span className={styles.badge}>{logs.length}</span>
          </div>
          <Link href="/logs" className={styles.viewAllLink}>View all &rarr;</Link>
        </div>
        <div className={styles.logsTable}>
          <div className={styles.logsHeader}>
            <span className={styles.logsColLevel}>Level</span>
            <span className={styles.logsColTime}>Time</span>
            <span className={styles.logsColCtx}>Context</span>
            <span className={styles.logsColMsg}>Message</span>
          </div>
          {recentLogs.length === 0 ? (
            <div className={styles.emptySmall}>No log entries yet</div>
          ) : (
            recentLogs.map((log: ILogEntry) => (
              <div key={log.id} className={styles.logRow}>
                <span className={`${styles.logLevel} ${logLevelClass(log.level)}`}>
                  {log.level}
                </span>
                <span className={styles.logTime}>{formatTime(log.timestamp)}</span>
                <span className={styles.logCtx}>{log.context}</span>
                <span className={styles.logMsg}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.quickActions}>
        {[
          { href: '/workflows/new', icon: 'add_circle', label: 'New Workflow', sub: 'Build pipeline' },
          { href: '/tasks', icon: 'task_alt', label: 'Browse Tasks', sub: 'View all tasks' },
          { href: '/logs', icon: 'receipt_long', label: 'View Logs', sub: 'System logs' },
          { href: '/settings', icon: 'settings', label: 'Settings', sub: 'Integrations' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={styles.quickChip}>
            <span className={styles.quickIcon}>
              <Icon name={a.icon} size={18} />
            </span>
            <div className={styles.quickText}>
              <span className={styles.quickLabel}>{a.label}</span>
              <span className={styles.quickSub}>{a.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
