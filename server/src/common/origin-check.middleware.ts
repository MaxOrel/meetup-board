import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// Вторая линия защиты от CSRF: запрос, который меняет данные, должен прийти со своего сайта.
// Браузер сам ставит заголовок Origin на POST, PATCH и DELETE, подделать его из страницы нельзя.
// Запросы без Origin (curl, тесты, сервер-сервер) пропускаем: у них нет cookie жертвы.
const allowed = new Set(
  (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:8080').split(',').map((o) => o.trim()),
);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function originCheck(request: Request, _response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  if (SAFE_METHODS.has(request.method) || !origin || allowed.has(origin)) return next();
  next(new ForbiddenException('Запрос с чужого сайта отклонён'));
}
