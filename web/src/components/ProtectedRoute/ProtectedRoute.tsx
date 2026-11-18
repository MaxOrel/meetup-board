import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAppSelector } from '../../store/hooks.ts'
import { selectSession } from '../../store/authSlice.ts'

// Защищённый маршрут: гостя отправляем на вход и запоминаем, куда он шёл.
// Это удобство, а не защита: данные защищает сервер, отвечая 401 без cookie сессии.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = useAppSelector(selectSession)
  const location = useLocation()

  // Сервер ещё не ответил на /me — не знаем, вошли ли мы
  if (session === 'checking') return <main className="container" aria-busy="true" aria-label="Проверяем вход" />
  if (session === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
