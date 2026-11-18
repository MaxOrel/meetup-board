import { Chip } from '../../ui/Chip/Chip.tsx'
import { CATEGORIES, type CategoryFilterValue } from '../../constants.ts'
import styles from './CategoryFilter.module.css'

export interface CategoryFilterProps {
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
}

// Компонент фичи: знает про категории событий и собирает UI-kit (Chip) в фильтр
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className={styles.filters} role="group" aria-label="Фильтр по категории">
      {CATEGORIES.map((category) => (
        <Chip key={category.id} pressed={category.id === value} onClick={() => onChange(category.id)}>
          {category.label}
        </Chip>
      ))}
    </div>
  )
}
