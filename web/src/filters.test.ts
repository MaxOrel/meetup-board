import { describe, expect, it } from 'vitest'
import { filtersReducer, initialFilters } from './filters.ts'

// Редюсер — тоже чистая функция: состояние + экшен → новое состояние
describe('filtersReducer', () => {
  it('новая категория сбрасывает страницу на первую', () => {
    const onPage3 = { ...initialFilters, page: 3 }
    const next = filtersReducer(onPage3, { type: 'setCategory', category: 'design' })
    expect(next).toEqual({ ...initialFilters, category: 'design', page: 1 })
  })

  it('новый поиск тоже начинается с первой страницы', () => {
    const next = filtersReducer({ ...initialFilters, page: 5 }, { type: 'setQuery', query: 'react' })
    expect(next.page).toBe(1)
    expect(next.query).toBe('react')
  })

  it('«Повторить» меняет attempt, остальное не трогает', () => {
    const state = { ...initialFilters, category: 'ai' as const }
    const next = filtersReducer(state, { type: 'retry' })
    expect(next).toEqual({ ...state, attempt: 1 })
  })

  it('не мутирует старое состояние', () => {
    const state = { ...initialFilters }
    filtersReducer(state, { type: 'setPage', page: 2 })
    expect(state.page).toBe(1)
  })
})
