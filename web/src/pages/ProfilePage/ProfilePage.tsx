import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { selectUser, signOut } from '../../store/authSlice.ts'
import { Avatar } from '../../ui/Avatar/Avatar.tsx'
import { Button } from '../../ui/Button/Button.tsx'
import styles from './ProfilePage.module.css'

// Страница за ProtectedRoute: сюда попадают только после входа.
// Раздел «Избранное» из макета — задание к этому вебинару.
export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  if (!user) return null

  return (
    <main className={`container ${styles.profile}`}>
      <section className={styles.account} aria-label="Аккаунт">
        <Avatar name={user.name} size="l" />
        <div className={styles.info}>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
        {/* Переход после выхода не пишем: ProtectedRoute увидит гостя на /profile и сам отправит на вход */}
        <Button variant="ghost" onClick={() => dispatch(signOut())}>Выйти</Button>
      </section>
    </main>
  )
}
