import { Body, Controller, Get, HttpCode, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { toPublicUser } from '../users/user.entity.js';
import { AuthGuard, type AuthRequest } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // Вход ничего не создаёт — поэтому 200, а не 201
  @Post('auth/login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // Защищённый маршрут: без верного токена guard ответит 401 раньше, чем сработает обработчик
  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthRequest) {
    const user = await this.users.findById(request.user.sub);
    if (!user) throw new NotFoundException('Пользователь удалён');
    return toPublicUser(user);
  }
}
