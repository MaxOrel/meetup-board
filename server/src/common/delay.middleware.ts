import type { NextFunction, Request, Response } from 'express';

// Учебная задержка: /api/v1/events?_delay=2000 — ответ придёт через 2 секунды (не больше 5).
// Так на фронте видно скелетоны, гонки запросов и цену медленного API.
export function delayMiddleware(req: Request, _res: Response, next: NextFunction) {
  const delay = Math.min(Number(req.query._delay) || 0, 5000);
  if (delay > 0) setTimeout(next, delay);
  else next();
}
