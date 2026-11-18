import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index.ts'

// В store храним массив, а не Set: состояние Redux должно быть сериализуемым
export interface FavoritesState {
  ids: string[]
}

const initialState: FavoritesState = { ids: [] }

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Immer внутри createSlice: «мутируем» черновик, а на выходе — новый объект
    toggleFavorite(state, action: PayloadAction<string>) {
      const index = state.ids.indexOf(action.payload)
      if (index === -1) state.ids.push(action.payload)
      else state.ids.splice(index, 1)
    },
  },
})

export const { toggleFavorite } = favoritesSlice.actions
export const favoritesReducer = favoritesSlice.reducer

// Мемоизированный селектор: новый Set создаётся, только когда ids поменялись
export const selectFavoriteIds = createSelector(
  (state: RootState) => state.favorites.ids,
  (ids): ReadonlySet<string> => new Set(ids),
)
