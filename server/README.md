# MeetUp Board — учебный API на Nest (3 семестр, с вебинара 4)

Замена `../server-express` с тем же контрактом: фронт переключать не нужно.
С вебинара 5 данные лежат в **Postgres** (TypeORM), а база сразу заполняется тысячей событий.

```bash
npm install
cp .env.example .env
npm run db:up        # Postgres в Docker на localhost:5437
npm run start:dev    # http://localhost:3000/api/v1/events
```

- `?_delay=2000` — ответ придёт через 2 секунды (до 5000 мс): видно скелетоны и цену медленного API.
- `DB_LOG=true` в `.env` — каждый SQL-запрос печатается в консоль.
- Заново засеять базу: `docker compose down -v`, `npm run db:up`, перезапустить сервер.

## Вход
- `POST /auth/register` `{ name, email, password }` → 201 `{ user }` и cookie `meetup_session`; почта занята → 409 с ошибкой у поля `email`.
- `POST /auth/login` `{ email, password }` → 200 `{ user }` и cookie; неверные данные → 401.
- `POST /auth/logout` → 204, cookie стёрта.
- `GET /me` → пользователь, если браузер прислал cookie сессии; иначе 401.
- Cookie: `HttpOnly` (JavaScript её не видит), `SameSite=Lax`, `Path=/api`; `COOKIE_SECURE=true` — только по HTTPS, для прода.
- `POST`, `PATCH`, `DELETE` с чужим заголовком `Origin` → 403. Свои сайты — `ALLOWED_ORIGINS` (по умолчанию `http://localhost:5173,http://localhost:8080`).
- Учебные аккаунты создаются при старте: **user@meetup.local / meetup-demo** и администратор **admin@meetup.local / meetup-admin**.
- Создавать, менять и удалять события может только администратор: без входа — 401, обычный пользователь — 403.
- Пароли хранятся хешем `scrypt` с солью (`auth/password.ts`), токен — JWT на час, секрет — `JWT_SECRET`.

## Docker
`docker compose up --build` в корне репозитория — фронт, API и база, сайт на http://localhost:8080. Наружу открыт только nginx.

## Тесты
```bash
npm run test:e2e     # supertest: настоящее приложение и база meetup_test (создаётся сама)
```
Нужен запущенный Postgres (`npm run db:up`). Тесты чистят таблицу только в `meetup_test` — рабочая база не трогается.

## Где что лежит
| Файл | Что делает | Аналог в server-express |
|---|---|---|
| `events/event.entity.ts` | класс с `@Entity` и `@Column` — таблица Postgres и тип сразу | `models/event.model.ts` |
| `events/dto/*.dto.ts` | правила проверки через декораторы class-validator | `schemas/event.schema.ts` (Zod) |
| `events/events.controller.ts` | маршруты и HTTP-коды | `routes/events.ts` |
| `events/events.service.ts` | запросы к базе через QueryBuilder | тело обработчиков в `routes/events.ts` |
| `common/validation.ts` | глобальный `ValidationPipe` → 400 с `errors` по полям | `middleware/validate.ts` |
| `common/http-exception.filter.ts` | единый формат ошибок | `middleware/errors.ts` |
| `common/delay.middleware.ts` | учебная задержка `_delay` | `middleware/delay.ts` |
| `users/` | таблица users и поиск по почте | — |
| `auth/` | регистрация, вход, JWT, `AuthGuard` для защищённых маршрутов | — |

Не запускайте одновременно с `server-express`: оба слушают порт 3000.
