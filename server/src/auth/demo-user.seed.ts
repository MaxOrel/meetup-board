import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { hashPassword } from './password.js';

// Учебные аккаунты для демо на вебинаре (пароли — в README)
export const DEMO_USER = { email: 'user@meetup.local', name: 'Мария Ковалёва', password: 'meetup-demo', role: 'user' as const };
export const DEMO_ADMIN = { email: 'admin@meetup.local', name: 'Админ Афиши', password: 'meetup-admin', role: 'admin' as const };

// Пароли из README знает весь интернет. На публичном сервере таких аккаунтов быть не должно.
// Учебные аккаунты создаём в разработке, в тестах и там, где это включено явно (SEED_DEMO_USERS=true).
const demoEnabled = () => process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_USERS === 'true';

@Injectable()
export class DemoUserSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoUserSeed.name);

  constructor(private readonly users: UsersService) {}

  async onApplicationBootstrap() {
    if (demoEnabled()) {
      for (const { password, ...account } of [DEMO_USER, DEMO_ADMIN]) {
        if (await this.users.findByEmail(account.email)) continue;
        await this.users.create({ ...account, passwordHash: await hashPassword(password) });
        this.logger.log(`Учебный аккаунт: ${account.email}`);
      }
    }
    await this.ensureAdminFromEnv();
  }

  // Первый администратор боевого сервера: почта и пароль приходят из окружения, в репозитории их нет
  private async ensureAdminFromEnv() {
    const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
    if (!email || !password) return;
    if (password.length < 12) throw new Error('ADMIN_PASSWORD короче 12 символов');
    if (await this.users.findByEmail(email)) return;
    await this.users.create({ email, name: 'Администратор', role: 'admin', passwordHash: await hashPassword(password) });
    this.logger.log(`Администратор создан: ${email}`);
  }
}
