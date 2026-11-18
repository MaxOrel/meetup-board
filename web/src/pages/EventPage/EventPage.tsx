import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, fetchEvent } from '../../api/events.ts'
import { CATEGORY_LABELS } from '../../constants.ts'
import { formatEventDate, seatsLabel } from '../../lib/format.ts'
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { selectFavoriteIds, toggleFavorite } from '../../store/favoritesSlice.ts'
import { Button } from '../../ui/Button/Button.tsx'
import { Notice } from '../../ui/Notice/Notice.tsx'
import type { MeetupEvent } from '../../types.ts'
import styles from './EventPage.module.css'

// Состояние страницы — объединение: в success событие точно есть, в error — точно есть текст
type EventState =
  | { status: 'loading' }
  | { status: 'success'; event: MeetupEvent }
  | { status: 'error'; message: string; notFound: boolean }

export default function EventPage() {
  // :id из маршрута /events/:id. Строка или undefined — роутер не знает, что параметр обязателен.
  const { id = '' } = useParams()
  // key: другой id — другой компонент. React создаст его заново, и состояние начнётся с loading.
  return <EventLoader key={id} id={id} />
}

function EventLoader({ id }: { id: string }) {
  const [state, setState] = useState<EventState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    window.scrollTo({ top: 0 })
    fetchEvent(id, controller.signal)
      .then((event) => setState({ status: 'success', event }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof ApiError ? error.message : 'Проверьте, что API запущен, и обновите страницу.'
        setState({ status: 'error', message, notFound: error instanceof ApiError && error.kind === 'not-found' })
      })
    return () => controller.abort()
  }, [id])

  return (
    <main className="container">
      <nav className={styles.breadcrumbs} aria-label="Навигационная цепочка">
        <Link to="/events">Афиша</Link>
        {state.status === 'success' && (
          <>
            <span aria-hidden="true">/</span>
            <span>{CATEGORY_LABELS[state.event.category]}</span>
          </>
        )}
      </nav>

      {state.status === 'loading' && <div className={styles.placeholder} aria-busy="true" aria-label="Загружаем событие" />}

      {state.status === 'error' && (
        <Notice
          variant={state.notFound ? 'empty' : 'error'}
          title={state.notFound ? 'Такого события нет' : 'Не удалось загрузить событие'}
          action={<Link to="/events">Ко всем событиям</Link>}
        >
          {state.notFound ? 'Возможно, его удалили или ссылка с опечаткой.' : state.message}
        </Notice>
      )}

      {state.status === 'success' && <EventDetails event={state.event} />}
    </main>
  )
}

function EventDetails({ event }: { event: MeetupEvent }) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector(selectFavoriteIds).has(event.id)
  const { day, month, time, weekday } = formatEventDate(event.date)
  const seatsLeft = event.seatsTotal - event.seatsTaken
  const place = event.format === 'offline' ? `${event.city}, офлайн` : 'Онлайн'
  const fillStyle = { width: `${Math.round((event.seatsTaken / event.seatsTotal) * 100)}%` } as CSSProperties

  return (
    <div className={styles.event} data-category={event.category}>
      <article>
        <img className={styles.cover} src={event.cover} alt="" />
        <h1 className={styles.title}>{event.title}</h1>
        <div className={styles.facts}>
          <span className={styles.fact}>
            <svg className="icon" aria-hidden="true"><use href="/icons.svg#calendar" /></svg>
            {day} {month}, {weekday}
          </span>
          <span className={styles.fact}>
            <svg className="icon" aria-hidden="true"><use href="/icons.svg#clock" /></svg>
            {time}
          </span>
          <span className={styles.fact}>
            <svg className="icon" aria-hidden="true"><use href="/icons.svg#pin" /></svg>
            {place}
          </span>
        </div>

        <section className={styles.section}>
          <h2 className={styles.h2}>О&nbsp;чём</h2>
          <p className={styles.text}>{event.description}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Спикер</h2>
          <p className={styles.speaker}>{event.speaker}</p>
        </section>
      </article>

      <aside className={styles.panel} aria-label="Места и избранное">
        <p className={styles.when}>
          <time dateTime={event.date}>{day} {month}, {time}</time>
        </p>
        <p className={styles.where}>{place}</p>
        <div className={styles.seats}>
          <div className={styles.track}><div className={styles.fill} style={fillStyle} /></div>
          <p className={styles.seatsLabel}>{seatsLabel(seatsLeft)} из {event.seatsTotal}</p>
        </div>
        <Button wide variant={isFavorite ? 'ghost' : 'primary'} aria-pressed={isFavorite} onClick={() => dispatch(toggleFavorite(event.id))}>
          {isFavorite ? 'Убрать из избранного' : 'В избранное'}
        </Button>
      </aside>
    </div>
  )
}
