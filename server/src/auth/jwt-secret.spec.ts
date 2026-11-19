import { afterEach, describe, expect, it, vi } from 'vitest';
import { jwtSecret } from './jwt-secret.js';

// Секрет — единственное, что отделяет настоящий токен от подделки. Правила проверяем тестом.
describe('jwtSecret', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('в разработке без секрета берёт удобное значение по умолчанию', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('JWT_SECRET', '');
    expect(jwtSecret()).toBe('dev-secret-change-me');
  });

  it('в проде без секрета не запускается', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', '');
    expect(() => jwtSecret()).toThrow('JWT_SECRET');
  });

  it('в проде короткий секрет тоже не подходит', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', 'change-me');
    expect(() => jwtSecret()).toThrow('короче 32');
  });

  it('в проде длинный секрет принимается', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(40));
    expect(jwtSecret()).toBe('a'.repeat(40));
  });
});
