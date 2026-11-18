import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export const CATEGORIES = ['frontend', 'backend', 'devops', 'design', 'ai', 'career'] as const;
export const FORMATS = ['online', 'offline'] as const;
export type Category = (typeof CATEGORIES)[number];
export type EventFormat = (typeof FORMATS)[number];

// Та же модель, что была в Mongo, только теперь это таблица events в Postgres.
// Класс — одновременно тип TS и описание таблицы: TypeORM создаст её по декораторам.
@Entity('events')
export class EventEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 80 })
  title: string;

  // Индексы — по полям, по которым фильтруем и сортируем
  @Index()
  @Column('timestamptz')
  date: Date;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: FORMATS })
  format: EventFormat;

  @Index()
  @Column({ type: 'enum', enum: CATEGORIES })
  category: Category;

  @Column()
  speaker: string;

  @Column('int')
  seatsTotal: number;

  @Column('int', { default: 0 })
  seatsTaken: number;

  @Column('text', { default: '' })
  description: string;

  @Column()
  cover: string;
}

// Объект контракта API: дата строкой ISO
export interface MeetupEvent extends Omit<EventEntity, 'date'> {
  date: string;
}

export function toMeetupEvent(row: EventEntity): MeetupEvent {
  return { ...row, date: row.date.toISOString() };
}
