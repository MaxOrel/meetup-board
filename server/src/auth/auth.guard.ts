import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Role } from '../users/user.entity.js';

// Что лежит внутри токена. sub — стандартное поле JWT «кому выдан».
export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

export type AuthRequest = Request & { user: TokenPayload };

// Guard решает, пускать ли запрос в обработчик.
// Ждём заголовок Authorization: Bearer <токен> с верной подписью и неистёкшим сроком.
// Passport с JwtStrategy делает то же самое — здесь без магии, чтобы были видны шаги.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Нужно войти');
    try {
      request.user = await this.jwt.verifyAsync<TokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Сессия истекла, войдите снова');
    }
  }
}
