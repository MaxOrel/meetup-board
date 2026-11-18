import type { z } from 'zod'
import type { categorySchema, eventSchema, formatSchema, userSchema } from './api/schemas.ts'

// Типы домена выводятся из Zod-схем: одно описание — и проверка, и типы
export type Category = z.infer<typeof categorySchema>
export type EventFormat = z.infer<typeof formatSchema>
export type MeetupEvent = z.infer<typeof eventSchema>
export type User = z.infer<typeof userSchema>

export interface Page<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
