// Выполняется перед каждым файлом тестов.
// jest-dom добавляет понятные проверки: toBeInTheDocument, toHaveTextContent, toBeDisabled…
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './server.ts'

// jsdom не умеет прокручивать страницу — подставляем пустую функцию
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// Запрос, для которого нет обработчика, — ошибка теста, а не тихий поход в сеть
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup() // каждый тест начинает с чистой страницы
  localStorage.clear() // и без токена, сохранённого прошлым тестом
  server.resetHandlers() // и с обычными ответами API, даже если прошлый тест их подменил
})
afterAll(() => server.close())
