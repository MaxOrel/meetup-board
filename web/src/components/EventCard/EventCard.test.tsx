import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { EventCard } from './EventCard.tsx'
import { baseEvent, soldEvent } from '../../fixtures/events.ts'

// Карточка использует Link — ей нужен роутер. В тестах — в памяти, без адресной строки.
function renderCard(props: Partial<Parameters<typeof EventCard>[0]> = {}) {
  const onToggleFavorite = vi.fn() // шпион: запоминает, с чем его вызвали
  render(
    <MemoryRouter>
      <EventCard event={baseEvent} isFavorite={false} onToggleFavorite={onToggleFavorite} {...props} />
    </MemoryRouter>,
  )
  return { onToggleFavorite }
}

// Ищем элементы так, как их видит пользователь: по роли и подписи, а не по классам
describe('EventCard', () => {
  it('показывает название ссылкой на страницу события', () => {
    renderCard()
    const link = screen.getByRole('link', { name: baseEvent.title })
    expect(link).toHaveAttribute('href', `/events/${baseEvent.id}`)
  })

  it('считает свободные места', () => {
    renderCard() // 40 мест, занято 14
    expect(screen.getByText('Осталось 26 мест')).toBeInTheDocument()
  })

  it('если мест нет, так и пишет', () => {
    renderCard({ event: soldEvent })
    expect(screen.getByText('Мест нет')).toBeInTheDocument()
  })

  it('клик по звезде передаёт id события', async () => {
    const user = userEvent.setup()
    const { onToggleFavorite } = renderCard()

    await user.click(screen.getByRole('button', { name: 'Добавить в избранное' }))

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    expect(onToggleFavorite).toHaveBeenCalledWith(baseEvent.id)
  })

  it('кнопка избранного сообщает своё состояние', () => {
    renderCard({ isFavorite: true })
    const button = screen.getByRole('button', { name: 'Убрать из избранного' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})
