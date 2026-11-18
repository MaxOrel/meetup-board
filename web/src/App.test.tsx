import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { baseEvent } from './fixtures/events.ts'
import { testUser } from './test/handlers.ts'
import { renderWithProviders } from './test/render.tsx'

// Сценарий через несколько страниц: каталог → избранное → страница события
describe('App', () => {
  it('избранное видно в шапке и на странице события', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/events' })

    const card = (await screen.findByRole('link', { name: baseEvent.title })).closest('article')!
    await user.click(card.querySelector('button')!)
    expect(screen.getByRole('link', { name: /Избранное/ })).toHaveTextContent('1')

    await user.click(screen.getByRole('link', { name: baseEvent.title }))

    // Страница события грузится лениво (lazy + Suspense): findBy дождётся и файла, и данных
    expect(await screen.findByRole('heading', { level: 1, name: baseEvent.title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Убрать из избранного' })).toBeInTheDocument()
  })

  it('гость на /profile попадает на вход, а после входа — обратно в профиль', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/profile' })

    expect(await screen.findByRole('heading', { name: 'С возвращением' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Эл. почта'), testUser.email)
    await user.type(screen.getByLabelText('Пароль'), 'meetup-demo')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('heading', { level: 1, name: testUser.name })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `Профиль: ${testUser.name}` })).toBeInTheDocument()
  })

  it('неверный пароль — сообщение над формой, остаёмся на входе', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/login' })

    await user.type(screen.getByLabelText('Эл. почта'), testUser.email)
    await user.type(screen.getByLabelText('Пароль'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверная почта или пароль')
    expect(screen.getByRole('heading', { name: 'С возвращением' })).toBeInTheDocument()
  })

  it('неизвестный адрес — страница «Такой страницы нет»', () => {
    renderWithProviders(<App />, { route: '/nope' })
    expect(screen.getByText('Такой страницы нет')).toBeInTheDocument()
  })

  it('несуществующее событие — сообщение, а не пустая страница', async () => {
    renderWithProviders(<App />, { route: '/events/00000000-0000-4000-8000-000000000000' })
    expect(await screen.findByText('Такого события нет')).toBeInTheDocument()
  })
})
