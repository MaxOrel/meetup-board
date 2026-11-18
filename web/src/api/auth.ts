import { z } from 'zod'
import { API_URL } from './events.ts'
import { apiErrorSchema, authResponseSchema, userSchema } from './schemas.ts'

export interface Credentials {
  email: string
  password: string
}

export interface Registration extends Credentials {
  name: string
}

export type AuthField = keyof Registration

// Ошибка входа или регистрации: общий текст и тексты у конкретных полей формы
export class AuthError extends Error {
  readonly status: number
  readonly fields: Partial<Record<AuthField, string>>

  constructor(status: number, message: string, fields: Partial<Record<AuthField, string>> = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function send<T extends z.ZodType>(path: string, init: RequestInit, schema: T): Promise<z.infer<T>> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new AuthError(0, 'Сервер не отвечает. Проверьте, что API запущен')
  }
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = apiErrorSchema.safeParse(body)
    if (!error.success) throw new AuthError(response.status, `Сервер ответил ${response.status}`)
    const fields = Object.fromEntries((error.data.errors ?? []).map(({ field, message }) => [field, message]))
    throw new AuthError(response.status, error.data.message, fields)
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    console.error('Ответ не совпал с контрактом:', z.prettifyError(result.error))
    throw new AuthError(0, 'Сервер прислал данные в неожиданном формате')
  }
  return result.data
}

const postJson = (data: object): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

export function login(credentials: Credentials) {
  return send('/auth/login', postJson(credentials), authResponseSchema)
}

export function register(registration: Registration) {
  return send('/auth/register', postJson(registration), authResponseSchema)
}

// Защищённый запрос: токен уходит в заголовке Authorization
export function fetchMe(token: string) {
  return send('/me', { headers: { Authorization: `Bearer ${token}` } }, userSchema)
}
