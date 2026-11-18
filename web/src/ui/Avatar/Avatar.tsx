import styles from './Avatar.module.css'

export interface AvatarProps {
  name: string
  size?: 's' | 'l'
}

// «Мария Ковалёва» → «МК». Для скринридера аватар декоративный: имя всегда написано рядом.
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Avatar({ name, size = 's' }: AvatarProps) {
  return (
    <span className={`${styles.avatar} ${styles[size]}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
