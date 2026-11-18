import type { ReactNode } from 'react'
import styles from './Notice.module.css'

export interface NoticeProps {
  variant: 'error' | 'empty' | 'success'
  title: string
  children?: ReactNode
  action?: ReactNode
}

// Ошибка объявляется скринридеру сразу (alert), остальное — вежливо (status)
export function Notice({ variant, title, children, action }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[variant]}`} role={variant === 'error' ? 'alert' : 'status'}>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  )
}
