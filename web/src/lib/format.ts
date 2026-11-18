const TIME_ZONE = 'Europe/Moscow'

export interface EventDateParts {
  day: string
  month: string
  time: string
  weekday: string
}

// Форматтеры создаём один раз при загрузке модуля. Конструктор Intl.DateTimeFormat дорогой:
// раньше каждая карточка создавала четыре штуки на каждом рендере — 48 карточек, 192 форматтера.
// Лучшая мемоизация — вынести константу из рендера, а не оборачивать её в useMemo.
const dayFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, day: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, month: 'short' })
const timeFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' })
const weekdayFormat = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, weekday: 'long' })

// Разбираем ISO-дату на части для корешка билета: 15 / окт / 19:00 / четверг
export function formatEventDate(iso: string): EventDateParts {
  const date = new Date(iso)
  return {
    day: dayFormat.format(date),
    month: monthFormat.format(date).replace('.', ''),
    time: timeFormat.format(date),
    weekday: weekdayFormat.format(date),
  }
}

// pluralize(3, ['место', 'места', 'мест']) → 'места'
export function pluralize(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function seatsLabel(seatsLeft: number): string {
  if (seatsLeft === 0) return 'Мест нет'
  return `Осталось ${seatsLeft} ${pluralize(seatsLeft, ['место', 'места', 'мест'])}`
}
