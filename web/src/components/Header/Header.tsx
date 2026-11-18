import { Link, NavLink } from 'react-router'
import type { User } from '../../types.ts'
import { Avatar } from '../../ui/Avatar/Avatar.tsx'
import styles from './Header.module.css'

export interface HeaderProps {
  favoritesCount: number
  // null — гость: вместо аватара ссылка «Войти»
  user: Pick<User, 'name'> | null
}

export function Header({ favoritesCount, user }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.logo} to="/events">
          MeetUp<span className={styles.mark}>/</span>Board
        </Link>
        <nav className={styles.nav} aria-label="Основная навигация">
          {/* NavLink сам ставит aria-current="page" на ссылку текущей страницы */}
          <NavLink className={`${styles.link} ${styles.home}`} to="/events">Афиша</NavLink>
          <a className={styles.link} href="#favorites">
            <svg className="icon" aria-hidden="true"><use href="/icons.svg#star" /></svg>
            <span className={styles.text}>Избранное</span>
            <span className={styles.counter}>{favoritesCount}</span>
          </a>
          {user ? (
            <NavLink className={`${styles.link} ${styles.account}`} to="/profile" aria-label={`Профиль: ${user.name}`}>
              <Avatar name={user.name} />
              <span className={styles.text}>{user.name.split(' ')[0]}</span>
            </NavLink>
          ) : (
            <NavLink className={styles.link} to="/login" aria-label="Войти">
              <svg className="icon" aria-hidden="true"><use href="/icons.svg#user" /></svg>
              <span className={styles.text}>Войти</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
