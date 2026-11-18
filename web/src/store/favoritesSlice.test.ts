import { describe, expect, it } from 'vitest'
import { favoritesReducer, selectFavoriteIds, toggleFavorite } from './favoritesSlice.ts'
import type { RootState } from './index.ts'

describe('favoritesSlice', () => {
  it('первое нажатие добавляет, второе убирает', () => {
    let state = favoritesReducer(undefined, toggleFavorite('a'))
    expect(state.ids).toEqual(['a'])
    state = favoritesReducer(state, toggleFavorite('a'))
    expect(state.ids).toEqual([])
  })

  it('селектор отдаёт тот же Set, пока ids не менялись', () => {
    // Мемоизация проверяется тестом: иначе memo у карточек молча перестанет работать
    const root = { favorites: { ids: ['a', 'b'] } } as RootState
    const first = selectFavoriteIds(root)
    expect(first.has('b')).toBe(true)
    expect(selectFavoriteIds(root)).toBe(first)
  })
})
