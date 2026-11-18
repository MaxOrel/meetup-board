// Секрет подписи токенов. У кого он есть — тот может выписать себе любой токен, даже админский.
// Поэтому в проде приложение без нормального секрета не стартует: лучше упасть сразу, чем работать с дырой.
const MIN_LENGTH = 32;

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < MIN_LENGTH) {
      throw new Error(`JWT_SECRET не задан или короче ${MIN_LENGTH} символов. Сгенерировать: openssl rand -hex 32`);
    }
    return secret;
  }
  // Разработка и тесты: удобное значение по умолчанию
  return secret || 'dev-secret-change-me';
}
