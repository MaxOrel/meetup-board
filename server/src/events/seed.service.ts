import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Repository } from 'typeorm';
import { EventEntity, type MeetupEvent } from './event.entity.js';

// Пустая база → заливаем тысячу событий: на таком объёме видно, что тормозит.
// SEED_FILE=data/events.json — маленький набор из 60 событий.
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectRepository(EventEntity) private readonly events: Repository<EventEntity>) {}

  async onApplicationBootstrap() {
    if ((await this.events.count()) > 0) return;
    const file = resolve(process.cwd(), process.env.SEED_FILE ?? 'data/events-1000.json');
    const data = JSON.parse(await readFile(file, 'utf8')) as MeetupEvent[];
    // chunk: вставляем пачками по 200 строк, а не одним огромным INSERT
    await this.events.save(data.map((e) => ({ ...e, date: new Date(e.date) })), { chunk: 200 });
    this.logger.log(`Засеяно событий: ${data.length}`);
  }
}
