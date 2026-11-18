# MeetUp Board

Афиша IT-митапов: фронт на React + TypeScript (`web/`), API на Nest + Postgres (`server/`).

## Запуск
- Разработка: `server/` — `npm run db:up && npm run start:dev` (API на :3000), `web/` — `npm run dev` (сайт на :5173)
- Всё приложение в контейнерах: `docker compose up --build` → http://localhost:8080

## Сервер
`deploy/` — боевой compose, Caddy с HTTPS, `deploy.sh` с откатом и `server-setup.sh` для чистой Ubuntu. Подробно — `deploy/README.md`.
