import type { Category } from './types.ts'

export type CategoryFilterValue = Category | 'all'

export const CATEGORIES: { id: CategoryFilterValue; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'frontend', label: 'Фронтенд' },
  { id: 'backend', label: 'Бэкенд' },
  { id: 'devops', label: 'DevOps' },
  { id: 'design', label: 'Дизайн' },
  { id: 'ai', label: 'AI' },
  { id: 'career', label: 'Карьера' },
]

// Record<Category, string> — TS проверит, что подписи есть у всех категорий
export const CATEGORY_LABELS: Record<Category, string> = {
  frontend: 'Фронтенд',
  backend: 'Бэкенд',
  devops: 'DevOps',
  design: 'Дизайн',
  ai: 'AI',
  career: 'Карьера',
}
