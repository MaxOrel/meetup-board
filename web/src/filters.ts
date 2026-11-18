import type { CategoryFilterValue } from './constants.ts'

// Фильтры — локальное состояние страницы: useReducer вместо нескольких useState.
// Экшены — размеченное объединение: TS не даст отправить экшен с опечаткой или без нужного поля.

export interface FiltersState {
  category: CategoryFilterValue
  query: string // строка поиска
  page: number
  attempt: number // «Повторить» — новый запрос с теми же фильтрами
}

export type FiltersAction =
  | { type: 'setCategory'; category: CategoryFilterValue }
  | { type: 'setQuery'; query: string }
  | { type: 'setPage'; page: number }
  | { type: 'retry' }
  | { type: 'reset' }

export const initialFilters: FiltersState = { category: 'all', query: '', page: 1, attempt: 0 }

export function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case 'setCategory':
      // Новый фильтр — снова с первой страницы
      return { ...state, category: action.category, page: 1 }
    case 'setQuery':
      return { ...state, query: action.query, page: 1 }
    case 'setPage':
      return { ...state, page: action.page }
    case 'retry':
      return { ...state, attempt: state.attempt + 1 }
    case 'reset':
      return initialFilters
    default: {
      // Если добавить новый тип экшена и забыть его обработать — здесь будет ошибка компиляции
      const unreachable: never = action
      return unreachable
    }
  }
}
