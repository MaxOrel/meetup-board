import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice.ts'
import { eventsReducer } from './eventsSlice.ts'
import { favoritesReducer } from './favoritesSlice.ts'

// Фабрика: приложению — один store, каждому тесту — свой, чистый
export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      events: eventsReducer,
      favorites: favoritesReducer,
    },
  })
}

export const store = makeStore()

// Типы выводятся из самого store — руками их не пишем
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
