import { Button } from '../../ui/Button/Button.tsx'
import styles from './Pager.module.css'

export interface PagerProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export function Pager({ page, pageCount, onChange }: PagerProps) {
  if (pageCount <= 1) return null
  return (
    <nav className={styles.pager} aria-label="Страницы каталога">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Назад</Button>
      <p className={styles.status}>Страница {page} из {pageCount}</p>
      <Button variant="ghost" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Вперёд</Button>
    </nav>
  )
}
