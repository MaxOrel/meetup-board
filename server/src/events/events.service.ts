import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, toMeetupEvent, type MeetupEvent } from './event.entity.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { ListEventsQuery } from './dto/list-events.query.js';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Сервис — вся работа с данными. Контроллер про HTTP ничего здесь не знает.
@Injectable()
export class EventsService {
  constructor(@InjectRepository(EventEntity) private readonly events: Repository<EventEntity>) {}

  // Пагинация на сервере: из тысячи событий клиенту уходит одна страница.
  // Значения — только параметрами (:q), никакой склейки строк в SQL.
  async findAll({ category, format, q, page, limit }: ListEventsQuery): Promise<Page<MeetupEvent>> {
    const qb = this.events.createQueryBuilder('e');
    if (category) qb.andWhere('e.category = :category', { category });
    if (format) qb.andWhere('e.format = :format', { format });
    if (q) qb.andWhere('(e.title ILIKE :q OR e.speaker ILIKE :q)', { q: `%${q}%` });

    qb.orderBy('e.date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    // Один вызов — два запроса: страница (LIMIT/OFFSET) и общее число (COUNT)
    const [rows, total] = await qb.getManyAndCount();
    return { items: rows.map(toMeetupEvent), total, page, limit };
  }

  async findOne(id: string): Promise<MeetupEvent> {
    const row = await this.events.findOneBy({ id });
    if (!row) throw new NotFoundException('Событие не найдено');
    return toMeetupEvent(row);
  }

  async create(dto: CreateEventDto): Promise<MeetupEvent> {
    const seatsTaken = dto.seatsTaken ?? 0;
    this.checkSeats(seatsTaken, dto.seatsTotal);
    const row = await this.events.save({ ...dto, id: randomUUID(), seatsTaken, date: new Date(dto.date) });
    return toMeetupEvent(row);
  }

  async update(id: string, dto: UpdateEventDto): Promise<MeetupEvent> {
    const row = await this.events.findOneBy({ id });
    if (!row) throw new NotFoundException('Событие не найдено');
    this.checkSeats(dto.seatsTaken ?? row.seatsTaken, dto.seatsTotal ?? row.seatsTotal);
    const saved = await this.events.save({ ...row, ...dto, date: dto.date ? new Date(dto.date) : row.date });
    return toMeetupEvent(saved);
  }

  async remove(id: string): Promise<void> {
    const { affected } = await this.events.delete({ id });
    if (!affected) throw new NotFoundException('Событие не найдено');
  }

  private checkSeats(seatsTaken: number, seatsTotal: number) {
    if (seatsTaken > seatsTotal) {
      throw new BadRequestException({
        message: 'Ошибка валидации',
        errors: [{ field: 'seatsTaken', message: 'Занято мест больше, чем всего' }],
      });
    }
  }
}
