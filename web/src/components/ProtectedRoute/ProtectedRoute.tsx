import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAppSelector } from '../../store/hooks.ts'
import { selectIsSignedIn, selectUser } from '../../store/authSlice.ts'

// Защищённый маршрут: гостя отправляем на вход и запоминаем, куда он шёл.
// Это удобство, а не защита: данные защищает сервер, отвечая 401 без токена.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isSignedIn = useAppSelector(selectIsSignedIn)
  const user = useAppSelector(selectUser)
  const location = useLocation()

  if (!isSignedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // Токен есть, но сервер ещё не ответил, чей он (restoreSession в App)
  if (!user) return <main className="container" aria-busy="true" aria-label="Проверяем вход" />
  return children
}
