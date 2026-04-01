'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useThemeStore } from '@/stores/theme.store';
import { APP_NAME } from '@/lib/constants';
import styles from './sidebar.module.css';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/tasks', label: 'Tasks', icon: 'task_alt' },
  { href: '/workflows', label: 'Workflows', icon: 'account_tree' },
  { href: '/logs', label: 'Logs', icon: 'receipt_long' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useThemeStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>A</div>
          <span className={styles.logoText}>{APP_NAME}</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <button className={styles.themeToggle} onClick={toggle}>
          <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
