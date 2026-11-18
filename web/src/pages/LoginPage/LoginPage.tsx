import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import type { AuthField } from '../../api/auth.ts'
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { clearAuthError, selectUser, signIn, signUp } from '../../store/authSlice.ts'
import { Button } from '../../ui/Button/Button.tsx'
import styles from './LoginPage.module.css'

export interface LoginPageProps {
  mode: 'login' | 'register'
}

// Вход и регистрация — одна карточка: режим задаёт маршрут (/login или /register)
export function LoginPage({ mode }: LoginPageProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectUser)
  const { status, error } = useAppSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const isLogin = mode === 'login'
  // Куда вернуть после входа: ProtectedRoute кладёт сюда адрес, с которого отправил на вход
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  // Переключили режим — старая ошибка больше не про эту форму
  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch, mode])

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<AuthField, string>
    const action = isLogin ? signIn({ email: data.email, password: data.password }) : signUp(data)
    // Ошибка входа уже лежит в store и показана у полей — уходим со страницы только при успехе
    const result = await dispatch(action)
    if (result.meta.requestStatus === 'fulfilled') navigate(from, { replace: true })
  }

  const fieldError = (field: AuthField) => error?.fields[field]
  const generalError = error && Object.keys(error.fields).length === 0 ? error.message : null
  const pending = status === 'pending'

  return (
    <main className={`container ${styles.auth}`}>
      <section className={styles.card} aria-labelledby="auth-title">
        <nav className={styles.tabs} aria-label="Вход или регистрация">
          <Link className={styles.tab} to="/login" state={location.state} aria-current={isLogin ? 'page' : undefined}>Вход</Link>
          <Link className={styles.tab} to="/register" state={location.state} aria-current={isLogin ? undefined : 'page'}>Регистрация</Link>
        </nav>
        <h1 className={styles.title} id="auth-title">{isLogin ? 'С возвращением' : 'Новый аккаунт'}</h1>
        <p className={styles.lead}>
          {isLogin
            ? 'Афиша и избранное работают и без входа. Войдите, чтобы открыть профиль.'
            : 'Профиль покажет ваше избранное. Афиша по-прежнему открыта всем.'}
        </p>
        <div className={styles.tear} aria-hidden="true" />

        {/* key: при смене режима React создаст форму заново — поля очистятся */}
        <form key={mode} className={styles.form} onSubmit={handleSubmit} noValidate>
          {generalError && <p className={styles.alert} role="alert">{generalError}</p>}

          {!isLogin && (
            <Field id="name" label="Имя" error={fieldError('name')}>
              <input className={styles.input} id="name" name="name" autoComplete="name" required
                aria-invalid={Boolean(fieldError('name'))} aria-describedby={fieldError('name') ? 'name-error' : undefined} />
            </Field>
          )}

          <Field id="email" label="Эл. почта" error={fieldError('email')}>
            <input className={styles.input} id="email" name="email" type="email" autoComplete="email" inputMode="email" required
              aria-invalid={Boolean(fieldError('email'))} aria-describedby={fieldError('email') ? 'email-error' : undefined} />
          </Field>

          <Field
            id="password"
            label="Пароль"
            error={fieldError('password')}
            hint={isLogin ? undefined : 'Не короче 8 символов'}
            action={
              <button className={styles.linkButton} type="button" aria-controls="password" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            }
          >
            <input className={styles.input} id="password" name="password" type={showPassword ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} required
              aria-invalid={Boolean(fieldError('password'))}
              aria-describedby={fieldError('password') ? 'password-error' : isLogin ? undefined : 'password-hint'} />
          </Field>

          <Button type="submit" wide disabled={pending}>
            {pending ? (isLogin ? 'Входим…' : 'Создаём…') : isLogin ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </form>

        <p className={styles.note}>
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <Link to={isLogin ? '/register' : '/login'} state={location.state}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</Link>
        </p>
      </section>
    </main>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}

function Field({ id, label, error, hint, action, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        {action}
      </div>
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-error`}>{error}</p>
      ) : (
        hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>
      )}
    </div>
  )
}
