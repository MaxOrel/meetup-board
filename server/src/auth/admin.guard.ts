import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthRequest } from './auth.guard.js';

// Ставится после AuthGuard: тот уже проверил токен и положил пользователя в request.user.
// 401 — «кто ты?», 403 — «знаю кто, но нельзя».
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<AuthRequest>();
    if (user?.role !== 'admin') throw new ForbiddenException('Нужны права администратора');
    return true;
  }
}
