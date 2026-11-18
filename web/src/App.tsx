import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { Header } from './components/Header/Header.tsx'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.tsx'
import { CatalogPage } from './pages/CatalogPage/CatalogPage.tsx'
import { LoginPage } from './pages/LoginPage/LoginPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.tsx'
import { useAppDispatch, useAppSelector } from './store/hooks.ts'
import { restoreSession, selectUser } from './store/authSlice.ts'
import { selectFavoriteIds } from './store/favoritesSlice.ts'

// Страницы грузятся отдельными файлами — только когда пользователь на них перешёл.
// lazy ждёт модуль с экспортом по умолчанию, поэтому в EventPage.tsx и ProfilePage.tsx — export default.
const EventPage = lazy(() => import('./pages/EventPage/EventPage.tsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage.tsx'))

// App — общий каркас: шапка на всех страницах, ниже — страница по адресу
function App() {
  const dispatch = useAppDispatch()
  const favorites = useAppSelector(selectFavoriteIds)
  const user = useAppSelector(selectUser)

  // Токен сохранился с прошлого раза — узнаём у сервера, чей он и действует ли ещё
  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  return (
    <>
      <Header favoritesCount={favorites.size} user={user} />
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<CatalogPage />} />
        <Route
          path="/events/:id"
          element={
            // Пока файл страницы загружается, Suspense показывает запасной вариант
            <Suspense fallback={<PageFallback />}>
              <EventPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<LoginPage mode="login" />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageFallback />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

function PageFallback() {
  return <main className="container" aria-busy="true" aria-label="Загружаем страницу" />
}

export default App
