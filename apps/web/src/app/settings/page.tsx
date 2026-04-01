'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, Button, Icon, Badge } from '@/components/ui';
import { API_URL } from '@/lib/constants';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface GoogleStatus {
  connected: boolean;
  email?: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<GoogleStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const justConnected = searchParams.get('connected') === 'true';

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.get<GoogleStatus>('/auth/google/status');
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = () => {
    window.location.href = `${API_URL}/auth/google/connect`;
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.post('/auth/google/disconnect');
      setStatus({ connected: false });
    } catch {
      // noop
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div>
      <Header title="Settings" subtitle="Manage connections and configuration" />

      {justConnected && (
        <div className={styles.successBanner}>
          <Icon name="check_circle" size={20} />
          <span>Gmail connected successfully</span>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Integrations</h2>

        <Card padding="lg">
          <div className={styles.integration}>
            <div className={styles.integrationInfo}>
              <div className={styles.integrationIcon}>
                <Icon name="mail" size={24} />
              </div>
              <div className={styles.integrationDetails}>
                <div className={styles.integrationHeader}>
                  <h3 className={styles.integrationName}>Gmail</h3>
                  <Badge variant={status.connected ? 'success' : 'default'}>
                    {loading ? 'Checking...' : status.connected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
                {status.connected && status.email && (
                  <p className={styles.integrationEmail}>{status.email}</p>
                )}
                <p className={styles.integrationDesc}>
                  Connect your Gmail account to enable Read Gmail, Send Gmail, and Morning Pulse tasks with real inbox data.
                </p>
              </div>
            </div>

            <div className={styles.integrationActions}>
              {status.connected ? (
                <Button
                  variant="danger"
                  size="sm"
                  icon="link_off"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon="link"
                  onClick={handleConnect}
                  disabled={loading}
                >
                  Connect Gmail
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Environment</h2>

        <Card padding="lg">
          <div className={styles.envGrid}>
            <div className={styles.envItem}>
              <span className={styles.envLabel}>API URL</span>
              <code className={styles.envValue}>{API_URL}</code>
            </div>
            <div className={styles.envItem}>
              <span className={styles.envLabel}>Gmail Status</span>
              <code className={styles.envValue}>
                {status.connected ? `Connected (${status.email})` : 'Not connected — using mock data'}
              </code>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
