import { EventCard } from '../EventCard/EventCard.tsx'
import type { MeetupEvent } from '../../types.ts'
import styles from './EventList.module.css'

export interface EventListProps {
  events: MeetupEvent[]
  favorites: ReadonlySet<string>
  onToggleFavorite: (id: string) => void
}

export function EventList({ events, favorites, onToggleFavorite }: EventListProps) {
  return (
    <section className={styles.catalog} aria-label="События">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isFavorite={favorites.has(event.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  )
}
