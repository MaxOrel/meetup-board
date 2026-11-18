import type { ReactNode } from 'react'
import styles from './Chip.module.css'

export interface ChipProps {
  children: ReactNode
  pressed?: boolean
  count?: number
  onClick?: () => void
}

export function Chip({ children, pressed = false, count, onClick }: ChipProps) {
  return (
    <button className={styles.chip} type="button" aria-pressed={pressed} onClick={onClick}>
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  )
}
