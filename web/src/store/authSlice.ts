import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AuthError, fetchMe, login, logout, register, type AuthField, type Credentials, type Registration } from '../api/auth.ts'
import type { User } from '../types.ts'
import type { AppDispatch, RootState } from './index.ts'

// Токена на фронте больше нет: он в httpOnly-cookie, JavaScript её не видит.
// Поэтому «вошли ли мы» знает только сервер — спрашиваем его через /me при старте.

export interface AuthFailure {
  status: number
  message: string
  fields: Partial<Record<AuthField, string>>
}

export interface AuthState {
  // checking — ждём ответа /me; guest — не вошли; user — вошли
  session: 'checking' | 'guest' | 'user'
  user: User | null
  status: 'idle' | 'pending' | 'failed'
  error: AuthFailure | null
}

const initialState: AuthState = { session: 'checking', user: null, status: 'idle', error: null }

// Ошибку превращаем в сериализуемый объект: класс AuthError в store класть нельзя
function toFailure(error: unknown): AuthFailure {
  if (error instanceof AuthError) return { status: error.status, message: error.message, fields: error.fields }
  return { status: 0, message: 'Что-то пошло не так. Попробуйте ещё раз', fields: {} }
}

const thunk = createAsyncThunk.withTypes<{ state: RootState; dispatch: AppDispatch; rejectValue: AuthFailure }>()

export const signIn = thunk('auth/signIn', async (credentials: Credentials, { rejectWithValue }) => {
  try {
    return (await login(credentials)).user
  } catch (error) {
    return rejectWithValue(toFailure(error))
  }
})

export const signUp = thunk('auth/signUp', async (registration: Registration, { rejectWithValue }) => {
  try {
    return (await register(registration)).user
  } catch (error) {
    return rejectWithValue(toFailure(error))
  }
})

// При старте: браузер сам отправит cookie, сервер ответит, чья она
export const restoreSession = thunk('auth/restoreSession', async (_: void, { rejectWithValue }) => {
  try {
    return await fetchMe()
  } catch (error) {
    return rejectWithValue(toFailure(error))
  }
})

// Выход: стереть httpOnly-cookie может только сервер
export const signOut = thunk('auth/signOut', async () => {
  await logout().catch(() => undefined) // сервер недоступен — на фронте всё равно выходим
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
      if (state.status === 'failed') state.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    for (const action of [signIn, signUp]) {
      builder
        .addCase(action.pending, (state) => {
          state.status = 'pending'
          state.error = null
        })
        .addCase(action.fulfilled, (state, { payload }) => {
          state.status = 'idle'
          state.session = 'user'
          state.user = payload
        })
        .addCase(action.rejected, (state, { payload }) => {
          state.status = 'failed'
          state.error = payload ?? { status: 0, message: 'Что-то пошло не так. Попробуйте ещё раз', fields: {} }
        })
    }
    builder
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.session = 'user'
        state.user = payload
      })
      .addCase(restoreSession.rejected, (state) => {
        // 401 — не вошли. Сервер недоступен — тоже считаем гостем: профиль всё равно не загрузится.
        if (state.session === 'checking') state.session = 'guest'
      })
      .addCase(signOut.fulfilled, () => ({ ...initialState, session: 'guest' as const }))
  },
})

export const { clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer

export const selectUser = (state: RootState) => state.auth.user
export const selectSession = (state: RootState) => state.auth.session
