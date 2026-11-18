# MeetUp Board — React (3 семестр)

```bash
npm install
cp .env.example .env   # адрес API
npm run dev            # http://localhost:5173
```

API по умолчанию — API из `../server` (порт 3000, с вебинара 5 — Postgres и тысяча событий).
Эталонный API из `/api` (порт 4000) подключается той же переменной: `VITE_API_URL=http://localhost:4000/api/v1`. Контракт одинаковый.

## Страницы
| Адрес | Страница |
|---|---|
| `/events` | каталог: поиск, категории, постраничный вывод по 48 событий |
| `/events/:id` | страница события (загружается отдельным файлом) |
| всё остальное | «Такой страницы нет» |

`/events?_delay=2000` — все запросы к API придут с задержкой 2 секунды: видно скелетоны и приглушённый список.

## Где что лежит
```
src/
  pages/        страницы — то, что стоит за маршрутом
  components/   компоненты фичи: карточка, фильтр, поиск, пагинация
  ui/           UI-kit без знания о событиях: Button, Chip, Notice
  store/        Redux: события и избранное
  api/          запросы к API и Zod-схемы ответа
  lib/          чистые функции и хуки: даты, склонения, useDebouncedValue
```

## Тесты
```bash
npm test               # Vitest: функции, компоненты, страницы с MSW вместо API
npm run test:watch     # то же, с перезапуском при изменениях
npm run e2e            # Cypress в Chrome: нужны запущенные server (:3000) и npm run dev (:5173)
npm run e2e:open       # Cypress с окном — видно каждый шаг
```
Моки API — `src/test/handlers.ts`, данные — `src/fixtures/events.ts` (те же, что в Storybook).
Если Cypress пишет `bad option: --smoke-test`, в терминале выставлена `ELECTRON_RUN_AS_NODE`: в PowerShell `$env:ELECTRON_RUN_AS_NODE=$null`.
