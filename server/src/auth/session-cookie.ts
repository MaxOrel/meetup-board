import type { CookieOptions } from 'express';

// Токен живёт в cookie, а не в localStorage.
// httpOnly — JavaScript на странице её не видит: даже внедрённый скрипт не унесёт токен.
// SameSite=Lax — браузер не отправит её с POST-запросом, который начался на чужом сайте (CSRF).
// Secure — только по HTTPS. На localhost браузеры разрешают и без него, в проде — COOKIE_SECURE=true.
export const SESSION_COOKIE = 'meetup_session';

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/api',
  maxAge: 60 * 60 * 1000, // столько же, сколько живёт сам токен
};
