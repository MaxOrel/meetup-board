import { Link } from 'react-router'
import { Notice } from '../../ui/Notice/Notice.tsx'

// Маршрут «*»: всё, что не совпало с другими маршрутами
export function NotFoundPage() {
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <Notice variant="empty" title="Такой страницы нет" action={<Link to="/events">Ко всем событиям</Link>}>
        Проверьте адрес или вернитесь в афишу.
      </Notice>
    </main>
  )
}
