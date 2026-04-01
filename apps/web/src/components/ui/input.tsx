'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Icon } from './icon';
import styles from './input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={`${styles.inputContainer} ${error ? styles.hasError : ''}`}>
          {icon && (
            <span className={styles.icon}>
              <Icon name={icon} size={18} />
            </span>
          )}
          <input
            ref={ref}
            className={`${styles.input} ${icon ? styles.withIcon : ''} ${className || ''}`}
            {...props}
          />
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
