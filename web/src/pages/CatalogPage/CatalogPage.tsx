import { useCallback, useEffect, useReducer } from 'react'
import { SearchField } from '../../components/SearchField/SearchField.tsx'
import { CategoryFilter } from '../../components/CategoryFilter/CategoryFilter.tsx'
import { EventList } from '../../components/EventList/EventList.tsx'
import { CatalogSkeleton } from '../../components/CatalogSkeleton/CatalogSkeleton.tsx'
import { Pager } from '../../components/Pager/Pager.tsx'
import { Button } from '../../ui/Button/Button.tsx'
import { Notice } from '../../ui/Notice/Notice.tsx'
import { PAGE_SIZE } from '../../api/events.ts'
import { useDebouncedValue } from '../../lib/useDebouncedValue.ts'
import { filtersReducer, initialFilters } from '../../filters.ts'
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { loadEvents } from '../../store/eventsSlice.ts'
import { selectFavoriteIds, toggleFavorite } from '../../store/favoritesSlice.ts'
import styles from './CatalogPage.module.css'

export function CatalogPage() {
  const [filters, dispatchFilters] = useReducer(filtersReducer, initialFilters)
  const dispatch = useAppDispatch()
  const events = useAppSelector((state) => state.events)
  const favorites = useAppSelector(selectFavoriteIds)

  // В поле — то, что печатают сейчас. В запрос — то, что не менялось 400 мс.
  const query = useDebouncedValue(filters.query, 400)

  // Thunk возвращает промис с методом abort — cleanup отменяет устаревший запрос
  useEffect(() => {
    const promise = dispatch(loadEvents({ category: filters.category, query, page: filters.page }))
    return () => promise.abort()
  }, [dispatch, filters.category, query, filters.page, filters.attempt])

  // useCallback: одна и та же функция между рендерами. Без неё memo у карточки бесполезен:
  // новая стрелка на каждый рендер — новый пропс — все 48 карточек перерисуются.
  const handleToggleFavorite = useCallback((id: string) => dispatch(toggleFavorite(id)), [dispatch])

  // Скелетон — только при первой загрузке. Когда список уже есть, оставляем его на экране.
  const isFirstLoad = events.status === 'idle' || (events.status === 'loading' && events.items.length === 0)
  // Повторная загрузка: старый список остаётся на экране, но приглушён — страница не прыгает
  const isRefreshing = events.status === 'loading' && events.items.length > 0
  const pageCount = Math.ceil(events.total / PAGE_SIZE)

  return (
    <main className="container">
      <section className={styles.hero}>
        <h1 className={styles.title}>Митапы, на&nbsp;которые хочется прийти</h1>
        <p className={styles.lead}>Запись бесплатная, места ограничены.</p>
        <SearchField value={filters.query} onChange={(query) => dispatchFilters({ type: 'setQuery', query })} />
      </section>

      <CategoryFilter
        value={filters.category}
        onChange={(category) => dispatchFilters({ type: 'setCategory', category })}
      />

      <div className={styles.results}>
        <p className={styles.count} role="status">
          {events.status === 'loading' ? 'Загружаем…' : `Найдено: ${events.total}`}
        </p>
      </div>

      {isFirstLoad && <CatalogSkeleton count={6} />}

      {events.status === 'error' && (
        <Notice
          variant="error"
          title="Не удалось загрузить события"
          action={<Button onClick={() => dispatchFilters({ type: 'retry' })}>Повторить</Button>}
        >
          {events.error}
        </Notice>
      )}

      {events.status === 'success' && events.items.length === 0 && (
        <Notice
          variant="empty"
          title="Ничего не нашли"
          action={<Button variant="ghost" onClick={() => dispatchFilters({ type: 'reset' })}>Сбросить фильтры</Button>}
        >
          Попробуйте другую категорию или запрос покороче.
        </Notice>
      )}

      {events.items.length > 0 && (
        <div className={isRefreshing ? styles.stale : undefined} aria-busy={isRefreshing}>
          <EventList events={events.items} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
          <Pager page={filters.page} pageCount={pageCount} onChange={(page) => {
            dispatchFilters({ type: 'setPage', page })
            window.scrollTo({ top: 0 })
          }} />
        </div>
      )}
    </main>
  )
}
