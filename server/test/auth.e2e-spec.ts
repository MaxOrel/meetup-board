import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { createApp } from '../src/main.js';
import { UserEntity } from '../src/users/user.entity.js';

// Вход со стороны API — тот же сценарий, что Cypress проходит в браузере.
// request.agent хранит cookie между запросами, как браузер.
describe('/api/v1/auth и /me (e2e)', () => {
  let app: INestApplication;
  let api: ReturnType<typeof request>;
  const maria = { name: 'Мария Ковалёва', email: 'Maria@Example.com', password: 'password123' };

  beforeAll(async () => {
    app = await createApp();
    await app.init();
    api = request(app.getHttpServer());
    // Таблица пользователей — только в тестовой базе, чистим целиком
    await app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity)).clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('регистрация → 201, httpOnly-cookie и пользователь; токена в теле нет', async () => {
    const res = await api.post('/api/v1/auth/register').send(maria).expect(201);
    expect(res.body).toEqual({ user: { id: expect.any(String), name: maria.name, email: 'maria@example.com', role: 'user' } });
    const cookie = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toMatch(/^meetup_session=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it('та же почта ещё раз → 409 с ошибкой у поля email', async () => {
    const res = await api.post('/api/v1/auth/register').send({ ...maria, email: 'maria@example.com' }).expect(409);
    expect(res.body.errors).toEqual([{ field: 'email', message: 'Аккаунт с этой почтой уже есть' }]);
  });

  it('короткий пароль и кривая почта → 400 с ошибками по полям', async () => {
    const res = await api.post('/api/v1/auth/register').send({ name: 'Ира', email: 'ira@', password: '123' }).expect(400);
    expect(res.body.errors.map((e: { field: string }) => e.field)).toEqual(['email', 'password']);
  });

  it('вход → cookie → /me; выход → cookie стёрта → /me 401', async () => {
    const browser = request.agent(app.getHttpServer());
    await browser.post('/api/v1/auth/login').send({ email: maria.email, password: maria.password }).expect(200);
    const me = await browser.get('/api/v1/me').expect(200);
    expect(me.body.email).toBe('maria@example.com');

    await browser.post('/api/v1/auth/logout').expect(204);
    await browser.get('/api/v1/me').expect(401);
  });

  it('неверный пароль и чужая почта — одинаковый ответ 401', async () => {
    const wrongPassword = await api.post('/api/v1/auth/login').send({ email: maria.email, password: 'nope-nope' }).expect(401);
    const unknownEmail = await api.post('/api/v1/auth/login').send({ email: 'nobody@example.com', password: 'nope-nope' }).expect(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it('/me без cookie и с поддельной cookie → 401', async () => {
    await api.get('/api/v1/me').expect(401);
    await api.get('/api/v1/me').set('Cookie', 'meetup_session=not.a.token').expect(401);
  });

  it('POST с чужого сайта (заголовок Origin) → 403', async () => {
    await api
      .post('/api/v1/auth/login')
      .set('Origin', 'https://other-site.example')
      .send({ email: maria.email, password: maria.password })
      .expect(403);
  });
});
