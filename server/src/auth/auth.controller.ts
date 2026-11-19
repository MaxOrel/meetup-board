import { Body, Controller, Get, HttpCode, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../users/users.service.js';
import { toPublicUser } from '../users/user.entity.js';
import { AuthGuard, type AuthRequest } from './auth.guard.js';
import { AuthService, type AuthResponse } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { SESSION_COOKIE, sessionCookieOptions } from './session-cookie.js';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  // passthrough: сами ставим cookie, а ответ Nest по-прежнему собирает из возвращаемого объекта
  @Post('auth/register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.startSession(await this.auth.register(dto), res);
  }

  // Вход ничего не создаёт — поэтому 200, а не 201
  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.startSession(await this.auth.login(dto), res);
  }

  // Выход: браузер удалит cookie. Сама cookie недоступна JavaScript, поэтому «забыть токен» на фронте нельзя — только так.
  @Post('auth/logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions, maxAge: undefined });
  }

  // Защищённый маршрут: без верного токена guard ответит 401 раньше, чем сработает обработчик
  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthRequest) {
    const user = await this.users.findById(request.user.sub);
    if (!user) throw new NotFoundException('Пользователь удалён');
    return toPublicUser(user);
  }

  // Токен уходит в httpOnly-cookie, в теле ответа — только пользователь
  private startSession({ accessToken, user }: AuthResponse, res: Response) {
    res.cookie(SESSION_COOKIE, accessToken, sessionCookieOptions);
    return { user };
  }
}
