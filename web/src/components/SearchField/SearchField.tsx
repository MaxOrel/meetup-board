import styles from './SearchField.module.css'

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

// Контролируемое поле: значение живёт в состоянии страницы, поле только показывает его
export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <label className={styles.search}>
      <svg className={`icon ${styles.icon}`} aria-hidden="true"><use href="/icons.svg#search" /></svg>
      <span className="visually-hidden">Поиск по событиям</span>
      <input
        className={styles.input}
        type="search"
        placeholder="Тема или спикер"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
