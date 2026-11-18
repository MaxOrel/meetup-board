import { z } from 'zod'

// Контракт ответа API в виде схемы. TypeScript проверяет код при сборке,
// Zod — реальные данные при получении: сервер может прислать что угодно.

export const categorySchema = z.enum(['frontend', 'backend', 'devops', 'design', 'ai', 'career'])
export const formatSchema = z.enum(['online', 'offline'])

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.iso.datetime({ offset: true }),
  city: z.string(),
  format: formatSchema,
  category: categorySchema,
  speaker: z.string(),
  seatsTotal: z.number().int().nonnegative(),
  seatsTaken: z.number().int().nonnegative(),
  description: z.string(),
  cover: z.string(),
})

// Дженерик-функция: страница из любых элементов
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
  })
}

export const eventsPageSchema = pageSchema(eventSchema)

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
})

// Ответ на вход и регистрацию: только пользователь. Токен сервер кладёт в httpOnly-cookie.
export const authResponseSchema = z.object({
  user: userSchema,
})

// Ошибка контракта: { statusCode, message, errors?: [{ field, message }] }
export const apiErrorSchema = z.object({
  message: z.string(),
  errors: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
})
