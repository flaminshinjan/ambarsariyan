'use client';

import { useToastStore, type ToastVariant } from '@/stores/toast.store';
import { Icon } from './icon';
import styles from './toast.module.css';

const variantIcon: Record<ToastVariant, string> = {
  info: 'info',
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.variant]}`}
        >
          <Icon
            name={toast.icon || variantIcon[toast.variant]}
            size={18}
            className={styles.icon}
          />
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.dismiss}
            onClick={() => remove(toast.id)}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
