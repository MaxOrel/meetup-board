import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Role } from '../users/user.entity.js';
import { SESSION_COOKIE } from './session-cookie.js';

// Что лежит внутри токена. sub — стандартное поле JWT «кому выдан».
export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

export type AuthRequest = Request & { user: TokenPayload };

// Guard решает, пускать ли запрос в обработчик.
// Токен берём из httpOnly-cookie (её ставит вход): подпись верная и срок не истёк — пускаем.
// Passport с JwtStrategy делает то же самое — здесь без магии, чтобы были видны шаги.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string' || !token) throw new UnauthorizedException('Нужно войти');
    try {
      request.user = await this.jwt.verifyAsync<TokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Сессия истекла, войдите снова');
    }
  }
}
