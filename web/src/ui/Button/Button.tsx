import type { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import styles from './Button.module.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  wide?: boolean
}

// UI-kit ничего не знает о событиях и избранном: только внешний вид и стандартные атрибуты кнопки
export function Button({ variant = 'primary', wide = false, type = 'button', className, ...rest }: ButtonProps) {
  const classes = clsx(styles.button, styles[variant], wide && styles.wide, className)
  return <button type={type} className={classes} {...rest} />
}
