// Тестовые события из api/seed/events.json — для историй Storybook и тестов
import type { MeetupEvent } from '../types.ts'

export const baseEvent: MeetupEvent = {
  id: '7aa88af4-bf7a-439e-a35d-1c441b497dc3',
  title: 'Компонентный подход в дизайне',
  date: '2026-10-02T09:30:00.000Z',
  city: 'Новосибирск',
  format: 'offline',
  category: 'design',
  speaker: 'Руслан Ахмедов',
  seatsTotal: 40,
  seatsTaken: 14,
  description: 'Компонентный подход в дизайне. Руслан Ахмедов расскажет о практическом опыте и разберёт вопросы участников. Формат: офлайн-встреча с нетворкингом.',
  cover: '/covers/design.svg'
}

export const lowEvent: MeetupEvent = {
  id: 'e581fbc2-902b-4e17-b355-2b73a80fb63c',
  title: 'Авторизация на JWT: где хранить токены',
  date: '2026-10-17T09:00:00.000Z',
  city: 'Новосибирск',
  format: 'offline',
  category: 'backend',
  speaker: 'Анна Орлова',
  seatsTotal: 60,
  seatsTaken: 55,
  description: 'Авторизация на JWT: где хранить токены. Анна Орлова расскажет о практическом опыте и разберёт вопросы участников. Формат: офлайн-встреча с нетворкингом.',
  cover: '/covers/backend.svg'
}

export const soldEvent: MeetupEvent = {
  id: 'a4b182c9-faa4-47c9-811b-88af4f21f6d9',
  title: 'Docker для фронтендера за один вечер',
  date: '2026-10-13T15:00:00.000Z',
  city: 'Санкт-Петербург',
  format: 'offline',
  category: 'devops',
  speaker: 'Наталья Белова',
  seatsTotal: 30,
  seatsTaken: 30,
  description: 'Docker для фронтендера за один вечер. Наталья Белова расскажет о практическом опыте и разберёт вопросы участников. Формат: офлайн-встреча с нетворкингом.',
  cover: '/covers/devops.svg'
}

export const onlineEvent: MeetupEvent = {
  id: '9c7a43f8-ea23-47e6-bd17-9833e456ac2e',
  title: 'Как проводить юзабилити-тестирование за один день',
  date: '2026-10-03T16:00:00.000Z',
  city: 'Онлайн',
  format: 'online',
  category: 'design',
  speaker: 'Артём Гусев',
  seatsTotal: 200,
  seatsTaken: 149,
  description: 'Как проводить юзабилити-тестирование за один день. Артём Гусев расскажет о практическом опыте и разберёт вопросы участников. Формат: онлайн-трансляция с чатом.',
  cover: '/covers/design.svg'
}

export const fixtureEvents: MeetupEvent[] = [baseEvent, lowEvent, soldEvent, onlineEvent]
