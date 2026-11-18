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
- `POST /auth/register` `{ name, email, password }` → 201 `{ accessToken, user }`; почта занята → 409 с ошибкой у поля `email`.
- `POST /auth/login` `{ email, password }` → 200 `{ accessToken, user }`; неверные данные → 401.
- `GET /me` с заголовком `Authorization: Bearer <accessToken>` → пользователь; без токена → 401.
- Учебный аккаунт создаётся при старте: **user@meetup.local / meetup-demo**.
- Пароли хранятся хешем `scrypt` с солью (`auth/password.ts`), токен — JWT на час, секрет — `JWT_SECRET`.

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
