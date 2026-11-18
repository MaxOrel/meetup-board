import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { hashPassword } from './password.js';

// Учебный аккаунт для демо на вебинаре (пароль — в README)
export const DEMO_USER = { email: 'user@meetup.local', name: 'Мария Ковалёва', password: 'meetup-demo' };

@Injectable()
export class DemoUserSeed implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoUserSeed.name);

  constructor(private readonly users: UsersService) {}

  async onApplicationBootstrap() {
    if (await this.users.findByEmail(DEMO_USER.email)) return;
    await this.users.create({ email: DEMO_USER.email, name: DEMO_USER.name, passwordHash: await hashPassword(DEMO_USER.password) });
    this.logger.log(`Учебный аккаунт: ${DEMO_USER.email}`);
  }
}
