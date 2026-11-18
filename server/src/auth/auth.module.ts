import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { DemoUserSeed } from './demo-user.seed.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      // Секрет подписи. В учебном режиме есть значение по умолчанию, в проде — только из окружения.
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, DemoUserSeed],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
