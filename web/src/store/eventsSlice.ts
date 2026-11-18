import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError, fetchEvents } from '../api/events.ts'
import type { CategoryFilterValue } from '../constants.ts'
import type { MeetupEvent, Page } from '../types.ts'

export interface EventsState {
  status: 'idle' | 'loading' | 'success' | 'error'
  items: MeetupEvent[]
  total: number
  error: string | null
}

const initialState: EventsState = { status: 'idle', items: [], total: 0, error: null }

export interface LoadEventsArgs {
  category: CategoryFilterValue
  query: string
  page: number
}

// createAsyncThunk<что вернёт, что принимает, { rejectValue: тип ошибки }>
// signal приходит от thunk: promise.abort() в cleanup эффекта отменяет запрос
export const loadEvents = createAsyncThunk<Page<MeetupEvent>, LoadEventsArgs, { rejectValue: string }>(
  'events/load',
  async ({ category, query, page }, { signal, rejectWithValue }) => {
    try {
      return await fetchEvents({ category, query, page, signal })
    } catch (error) {
      if (error instanceof ApiError) return rejectWithValue(error.message)
      throw error
    }
  },
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.status = 'success'
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(loadEvents.rejected, (state, action) => {
        if (action.meta.aborted) return // запрос отменён новым — это не ошибка
        state.status = 'error'
        state.items = []
        state.error = action.payload ?? 'Проверьте, что API запущен, и попробуйте ещё раз.'
      })
  },
})

export const eventsReducer = eventsSlice.reducer
