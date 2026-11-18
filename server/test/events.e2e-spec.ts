import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { createApp } from '../src/main.js';
import { EventEntity } from '../src/events/event.entity.js';
import { SeedService } from '../src/events/seed.service.js';

// e2e бэкенда: настоящее приложение и настоящая база (meetup_test), запросы через supertest.
// Это тот же сценарий, что проверяет фронт, только со стороны API.
describe('/api/v1/events (e2e)', () => {
  let app: INestApplication;
  let api: ReturnType<typeof request>;

  const validEvent = {
    title: 'Тесты как страховка рефакторинга',
    date: '2026-12-01T16:00:00Z',
    city: 'Москва',
    format: 'offline',
    category: 'frontend',
    speaker: 'Анна Орлова',
    seatsTotal: 30,
    cover: '/covers/frontend.svg',
  };

  beforeAll(async () => {
    app = await createApp();
    await app.init();
    api = request(app.getHttpServer());
    // Каждый прогон — с одинаковыми данными: чистим таблицу и заливаем 60 событий заново
    await app.get<Repository<EventEntity>>(getRepositoryToken(EventEntity)).clear();
    await app.get(SeedService).onApplicationBootstrap();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('чтение', () => {
    it('GET /events → страница по контракту', async () => {
      const res = await api.get('/api/v1/events').expect(200);
      expect(res.body).toMatchObject({ total: 60, page: 1, limit: 12 });
      expect(res.body.items).toHaveLength(12);
    });

    it('события отсортированы по дате', async () => {
      const res = await api.get('/api/v1/events?limit=100').expect(200);
      const dates = res.body.items.map((e: { date: string }) => e.date);
      expect(dates).toEqual([...dates].sort());
    });

    it('фильтр по категории и поиск', async () => {
      const byCategory = await api.get('/api/v1/events?category=design&limit=100').expect(200);
      expect(byCategory.body.items.every((e: { category: string }) => e.category === 'design')).toBe(true);

      const bySearch = await api.get('/api/v1/events?q=docker').expect(200);
      expect(bySearch.body.total).toBeGreaterThan(0);
      for (const e of bySearch.body.items) expect(e.title.toLowerCase()).toContain('docker');
    });

    it('неверный параметр → 400 с ошибкой по полю', async () => {
      const res = await api.get('/api/v1/events?limit=500').expect(400);
      expect(res.body.errors).toEqual([{ field: 'limit', message: 'Не больше 100 событий за раз' }]);
    });

    it('несуществующее и кривое id → 404', async () => {
      await api.get('/api/v1/events/00000000-0000-4000-8000-000000000000').expect(404);
      await api.get('/api/v1/events/not-a-uuid').expect(404);
    });
  });

  describe('изменение', () => {
    it('POST с ошибками → 400, сообщения по-русски по каждому полю', async () => {
      const res = await api.post('/api/v1/events').send({ ...validEvent, category: 'x', seatsTotal: 0 }).expect(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          { field: 'category', message: 'Неизвестная категория' },
          { field: 'seatsTotal', message: 'Мест должно быть больше нуля' },
        ]),
      );
    });

    it('полный цикл: создать → прочитать → изменить → удалить', async () => {
      const created = await api.post('/api/v1/events').send(validEvent).expect(201);
      const id: string = created.body.id;
      expect(created.body).toMatchObject({ ...validEvent, date: '2026-12-01T16:00:00.000Z', seatsTaken: 0 });

      await api.get(`/api/v1/events/${id}`).expect(200);

      const patched = await api.patch(`/api/v1/events/${id}`).send({ seatsTaken: 29 }).expect(200);
      expect(patched.body.seatsTaken).toBe(29);

      await api.patch(`/api/v1/events/${id}`).send({ seatsTaken: 31 }).expect(400);

      await api.delete(`/api/v1/events/${id}`).expect(204);
      await api.get(`/api/v1/events/${id}`).expect(404);
    });
  });
});
