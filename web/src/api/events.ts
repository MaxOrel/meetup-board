import { z } from 'zod'
import type { CategoryFilterValue } from '../constants.ts'
import type { MeetupEvent, Page } from '../types.ts'
import { eventSchema, eventsPageSchema } from './schemas.ts'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

// Для демо на вебинаре: http://localhost:5173/events?_delay=2000 — сервер ответит с задержкой
const demoDelay = new URLSearchParams(window.location.search).get('_delay')

// Сколько событий на странице каталога. Сервер отдаёт не больше 100 за раз.
export const PAGE_SIZE = 48

// Ошибка API с понятным для пользователя текстом
export class ApiError extends Error {
  readonly kind: 'http' | 'contract' | 'not-found'

  constructor(kind: 'http' | 'contract' | 'not-found', message: string) {
    super(message)
    this.kind = kind
  }
}

// Общая часть всех запросов: учебная задержка, код ответа, проверка схемой
async function request<T extends z.ZodType>(path: string, params: URLSearchParams, schema: T, signal?: AbortSignal): Promise<z.infer<T>> {
  if (demoDelay) params.set('_delay', demoDelay)
  const response = await fetch(`${API_URL}${path}?${params}`, { signal })
  if (response.status === 404) throw new ApiError('not-found', 'Такого события нет')
  if (!response.ok) throw new ApiError('http', `Сервер ответил ${response.status}`)

  const result = schema.safeParse(await response.json())
  if (!result.success) {
    console.error('Ответ не совпал с контрактом:', z.prettifyError(result.error))
    throw new ApiError('contract', 'Сервер прислал данные в неожиданном формате')
  }
  return result.data
}

interface FetchEventsParams {
  category?: CategoryFilterValue
  query?: string
  page?: number
  signal?: AbortSignal
}

export function fetchEvents({ category = 'all', query = '', page = 1, signal }: FetchEventsParams = {}): Promise<Page<MeetupEvent>> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) })
  if (category !== 'all') params.set('category', category)
  if (query.trim()) params.set('q', query.trim())
  return request('/events', params, eventsPageSchema, signal)
}

export function fetchEvent(id: string, signal?: AbortSignal): Promise<MeetupEvent> {
  return request(`/events/${encodeURIComponent(id)}`, new URLSearchParams(), eventSchema, signal)
}
