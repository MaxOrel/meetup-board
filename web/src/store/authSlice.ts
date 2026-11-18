import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AuthError, fetchMe, login, register, type AuthField, type Credentials, type Registration } from '../api/auth.ts'
import type { User } from '../types.ts'
import type { AppDispatch, RootState } from './index.ts'

// Токен живёт в localStorage, чтобы вход переживал перезагрузку страницы.
// Так делают во многих проектах. Чем это опасно и как хранить надёжнее — тема вебинара 7.
const TOKEN_KEY = 'meetup-token'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // приватный режим или запрет хранилища — просто не запоминаем вход
  }
}

export interface AuthFailure {
  status: number
  message: string
  fields: Partial<Record<AuthField, string>>
}

export interface AuthState {
  token: string | null
  user: User | null
  status: 'idle' | 'pending' | 'failed'
  error: AuthFailure | null
}

const initialState: AuthState = { token: readToken(), user: null, status: 'idle', error: null }

// Ошибку превращаем в сериализуемый объект: класс AuthError в store класть нельзя
function toFailure(error: unknown): AuthFailure {
  if (error instanceof AuthError) return { status: error.status, message: error.message, fields: error.fields }
  return { status: 0, message: 'Что-то пошло не так. Попробуйте ещё раз', fields: {} }
}

const thunk = createAsyncThunk.withTypes<{ state: RootState; dispatch: AppDispatch; rejectValue: AuthFailure }>()

export const signIn = thunk('auth/signIn', async (credentials: Credentials, { rejectWithValue }) => {
  try {
    const result = await login(credentials)
    writeToken(result.accessToken)
    return result
  } catch (error) {
    return rejectWithValue(toFailure(error))
  }
})

export const signUp = thunk('auth/signUp', async (registration: Registration, { rejectWithValue }) => {
  try {
    const result = await register(registration)
    writeToken(result.accessToken)
    return result
  } catch (error) {
    return rejectWithValue(toFailure(error))
  }
})

// После перезагрузки токен есть, а пользователя нет — спрашиваем сервер, кто это
export const restoreSession = thunk(
  'auth/restoreSession',
  async (_: void, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    try {
      return await fetchMe(token ?? '')
    } catch (error) {
      // 401 — токен истёк или подделан: забываем его
      if (error instanceof AuthError && error.status === 401) writeToken(null)
      return rejectWithValue(toFailure(error))
    }
  },
  { condition: (_, { getState }) => Boolean(getState().auth.token) && !getState().auth.user },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut: () => ({ ...initialState, token: null }),
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
          state.token = payload.accessToken
          state.user = payload.user
        })
        .addCase(action.rejected, (state, { payload }) => {
          state.status = 'failed'
          state.error = payload ?? { status: 0, message: 'Что-то пошло не так. Попробуйте ещё раз', fields: {} }
        })
    }
    builder
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.user = payload
      })
      .addCase(restoreSession.rejected, (state, { payload }) => {
        // 401 — токен недействителен, выходим. Сервер недоступен — токен оставляем: он ещё может быть рабочим.
        if (payload?.status === 401) state.token = null
      })
  },
})

export const { clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer

// Выход: забыть токен и очистить состояние. Побочный эффект — в thunk, редьюсер остаётся чистым.
export const signOut = () => (dispatch: AppDispatch) => {
  writeToken(null)
  dispatch(authSlice.actions.loggedOut())
}

export const selectUser = (state: RootState) => state.auth.user
export const selectIsSignedIn = (state: RootState) => state.auth.token !== null
