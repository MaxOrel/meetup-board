import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { toPublicUser, type PublicUser, type UserEntity } from '../users/user.entity.js';
import type { TokenPayload } from './auth.guard.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { hashPassword, verifyPassword } from './password.js';

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (await this.users.findByEmail(dto.email)) {
      // 409 и ошибка у конкретного поля — форма подсветит почту
      throw new ConflictException({
        message: 'Аккаунт с этой почтой уже есть',
        errors: [{ field: 'email', message: 'Аккаунт с этой почтой уже есть' }],
      });
    }
    const user = await this.users.create({ email: dto.email, name: dto.name, passwordHash: await hashPassword(dto.password) });
    return this.issue(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email);
    // Одна и та же ошибка для «нет такой почты» и «не тот пароль»:
    // иначе по ответу можно узнать, кто зарегистрирован
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }
    return this.issue(user);
  }

  private async issue(user: UserEntity): Promise<AuthResponse> {
    const payload: TokenPayload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: toPublicUser(user) };
  }
}
