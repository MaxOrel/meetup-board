import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

// scrypt — медленная функция хеширования из node:crypto: подбирать пароли по хешу дорого.
// У каждого пароля своя соль, поэтому одинаковые пароли дают разные хеши.
// В базе лежит строка «соль:хеш» в hex.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  // Сравнение за постоянное время: по скорости ответа нельзя угадать, сколько байт совпало
  return timingSafeEqual(actual, expected);
}
