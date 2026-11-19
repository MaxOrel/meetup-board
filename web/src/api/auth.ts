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

// credentials: 'include' — браузер отправляет и принимает httpOnly-cookie сессии.
// Сам токен фронт никогда не видит.
async function send(path: string, init: RequestInit = {}): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include' })
  } catch {
    throw new AuthError(0, 'Сервер не отвечает. Проверьте, что API запущен')
  }
  if (response.status === 204) return null
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = apiErrorSchema.safeParse(body)
    if (!error.success) throw new AuthError(response.status, `Сервер ответил ${response.status}`)
    const fields = Object.fromEntries((error.data.errors ?? []).map(({ field, message }) => [field, message]))
    throw new AuthError(response.status, error.data.message, fields)
  }
  return body
}

function parse<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
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

export async function login(credentials: Credentials) {
  return parse(authResponseSchema, await send('/auth/login', postJson(credentials)))
}

export async function register(registration: Registration) {
  return parse(authResponseSchema, await send('/auth/register', postJson(registration)))
}

// Кто вошёл: cookie уходит сама, заголовок Authorization больше не нужен
export async function fetchMe() {
  return parse(userSchema, await send('/me'))
}

export async function logout() {
  await send('/auth/logout', { method: 'POST' })
}
