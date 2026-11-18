import styles from './FavoriteButton.module.css'

export interface FavoriteButtonProps {
  active: boolean
  onToggle: () => void
}

export function FavoriteButton({ active, onToggle }: FavoriteButtonProps) {
  return (
    <button
      className={styles.fav}
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={onToggle}
    >
      <svg className="icon" aria-hidden="true"><use href="/icons.svg#star" /></svg>
    </button>
  )
}
