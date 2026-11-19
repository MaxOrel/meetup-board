import { http, HttpResponse } from 'msw'
import { API_URL } from '../api/events.ts'
import { fixtureEvents } from '../fixtures/events.ts'
import type { User } from '../types.ts'

// Учебный аккаунт — тот же, что создаёт server
export const testUser: User = { id: 'u1', email: 'user@meetup.local', name: 'Мария Ковалёва', role: 'user' }
// В Node у fetch нет cookie, поэтому «сессию» мок помнит сам. Сбрасывается после каждого теста.
let signedIn = false
export function resetSession() {
  signedIn = false
}

// MSW перехватывает fetch и отвечает как настоящий API — по тому же контракту.
// Фикстуры одни на Storybook, тесты и моки: изменили контракт — упадут все сразу.
export const handlers = [
  http.get(`${API_URL}/events`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const q = url.searchParams.get('q')?.toLowerCase()
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 12)

    const found = fixtureEvents.filter(
      (event) =>
        (!category || event.category === category) &&
        (!q || event.title.toLowerCase().includes(q) || event.speaker.toLowerCase().includes(q)),
    )
    const items = found.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ items, total: found.length, page, limit })
  }),

  http.get(`${API_URL}/events/:id`, ({ params }) => {
    const event = fixtureEvents.find((item) => item.id === params.id)
    if (!event) return HttpResponse.json({ statusCode: 404, message: 'Событие не найдено' }, { status: 404 })
    return HttpResponse.json(event)
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (email !== testUser.email || password !== 'meetup-demo') {
      return HttpResponse.json({ statusCode: 401, message: 'Неверная почта или пароль' }, { status: 401 })
    }
    signedIn = true
    return HttpResponse.json({ user: testUser })
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    signedIn = false
    return new HttpResponse(null, { status: 204 })
  }),

  // Защищённый маршрут: как настоящий сервер, без входа отвечает 401
  http.get(`${API_URL}/me`, () => {
    if (!signedIn) {
      return HttpResponse.json({ statusCode: 401, message: 'Нужно войти' }, { status: 401 })
    }
    return HttpResponse.json(testUser)
  }),
]
