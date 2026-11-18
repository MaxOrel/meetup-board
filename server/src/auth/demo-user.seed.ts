import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { hashPassword } from './password.js';

// Учебные аккаунты для демо на вебинаре (пароли — в README)
export const DEMO_USER = { email: 'user@meetup.local', name: 'Мария Ковалёва', password: 'meetup-demo', role: 'user' as const };
export const DEMO_ADMIN = { email: 'admin@meetup.local', name: 'Админ Афиши', password: 'meetup-admin', role: 'admin' as const };

@Injectable()
export class DemoUserSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoUserSeed.name);

  constructor(private readonly users: UsersService) {}

  async onApplicationBootstrap() {
    for (const { password, ...account } of [DEMO_USER, DEMO_ADMIN]) {
      if (await this.users.findByEmail(account.email)) continue;
      await this.users.create({ ...account, passwordHash: await hashPassword(password) });
      this.logger.log(`Учебный аккаунт: ${account.email}`);
    }
  }
}
