import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { CatalogPage } from './CatalogPage.tsx'
import { API_URL } from '../../api/events.ts'
import { baseEvent, fixtureEvents } from '../../fixtures/events.ts'
import { renderWithProviders } from '../../test/render.tsx'
import { server } from '../../test/server.ts'

// Страница целиком: Redux, thunk, fetch, Zod. Настоящий только сервер — его заменяет MSW.
describe('CatalogPage', () => {
  it('показывает события с сервера', async () => {
    renderWithProviders(<CatalogPage />)

    // findBy ждёт появления: ответ API приходит не сразу
    expect(await screen.findByText(`Найдено: ${fixtureEvents.length}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: baseEvent.title })).toBeInTheDocument()
  })

  it('поиск уходит на сервер и сужает список', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CatalogPage />)
    await screen.findByText(`Найдено: ${fixtureEvents.length}`)

    await user.type(screen.getByRole('searchbox', { name: 'Поиск по событиям' }), 'docker')

    // Запрос уйдёт через 400 мс тишины — findBy подождёт
    expect(await screen.findByText('Найдено: 1')).toBeInTheDocument()
    const catalog = screen.getByRole('region', { name: 'События' })
    expect(within(catalog).getAllByRole('article')).toHaveLength(1)
  })

  it('ошибка сервера — понятное сообщение и кнопка «Повторить»', async () => {
    // Подменяем ответ только для этого теста
    server.use(http.get(`${API_URL}/events`, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }))
    const user = userEvent.setup()
    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Сервер ответил 500')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Повторить' }))
    expect(await screen.findByText(`Найдено: ${fixtureEvents.length}`)).toBeInTheDocument()
  })

  it('ответ не по контракту не ломает страницу', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}) // Zod пишет подробности в консоль
    const broken = { ...baseEvent, seatsTaken: '14' }
    server.use(http.get(`${API_URL}/events`, () => HttpResponse.json({ items: [broken], total: 1, page: 1, limit: 48 })))
    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('Сервер прислал данные в неожиданном формате')).toBeInTheDocument()
  })
})
