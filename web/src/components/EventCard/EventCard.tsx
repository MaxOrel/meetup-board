import { memo, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { clsx } from 'clsx'
import { FavoriteButton } from '../FavoriteButton/FavoriteButton.tsx'
import { CATEGORY_LABELS } from '../../constants.ts'
import { formatEventDate, seatsLabel } from '../../lib/format.ts'
import type { MeetupEvent } from '../../types.ts'
import styles from './EventCard.module.css'

export interface EventCardProps {
  event: MeetupEvent
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
}

// Та же разметка, что в design/index.html. Имена классов теперь уникальны: Vite добавит хэш.
// memo: карточка перерисуется, только если изменились её пропсы (сравнение через Object.is).
// Пропсы должны быть стабильными: onToggleFavorite — из useCallback, isFavorite — boolean, а не весь Set.
export const EventCard = memo(function EventCard({ event, isFavorite, onToggleFavorite }: EventCardProps) {
  const { day, month, time, weekday } = formatEventDate(event.date)
  const seatsLeft = event.seatsTotal - event.seatsTaken
  const isSoldOut = seatsLeft === 0
  const isLow = seatsLeft > 0 && seatsLeft <= 5
  const takenPercent = Math.round((event.seatsTaken / event.seatsTotal) * 100)

  const className = clsx(styles.card, isFavorite && styles.favorite, isSoldOut && styles.soldOut)
  const meterStyle = { '--taken': `${takenPercent}%` } as CSSProperties

  return (
    <article className={className} data-category={event.category}>
      <div className={styles.stub}>
        <time className={styles.date} dateTime={event.date}>
          <span className={styles.day}>{day}</span>
          <span className={styles.month}>{month}</span>
        </time>
        <span className={styles.time}>{time}</span>
        <span className={styles.weekday}>{weekday}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.media}>
          <img className={styles.cover} src={event.cover} alt="" />
          <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(event.id)} />
        </div>
        <p className={styles.category}>{CATEGORY_LABELS[event.category]}</p>
        <h3 className={styles.title}>
          <Link className={styles.link} to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className={styles.meta}>
          <span>{event.format === 'offline' ? `${event.city}, офлайн` : 'Онлайн'}</span>
          <span>{event.speaker}</span>
        </p>
        <div className={styles.footer}>
          <p className={isLow ? `${styles.seats} ${styles.seatsLow}` : styles.seats}>{seatsLabel(seatsLeft)}</p>
          <div className={styles.meter} style={meterStyle}>
            <div className={styles.meterFill} />
          </div>
        </div>
      </div>
    </article>
  )
})
