import { setupServer } from 'msw/node'
import { handlers } from './handlers.ts'

// Сервер MSW для Node: работает в тестах вместо настоящего API
export const server = setupServer(...handlers)
