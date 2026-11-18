import { Controller, Get, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { delayMiddleware } from './common/delay.middleware.js';
import { EventEntity } from './events/event.entity.js';
import { EventsModule } from './events/events.module.js';
import { UserEntity } from './users/user.entity.js';

@Controller('health')
class HealthController {
  @Get()
  health() {
    // version — какой образ сейчас работает: на боевом сервере туда попадает хеш коммита из CI
    return { status: 'ok', version: process.env.APP_VERSION ?? 'dev' };
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL ?? 'postgres://meetup:meetup@localhost:5437/meetup',
      entities: [EventEntity, UserEntity],
      // Учебный режим: таблицы создаются по сущностям. В проде — миграции.
      synchronize: true,
      // DB_LOG=true — печатать каждый SQL-запрос в консоль (пригодится искать N+1)
      logging: process.env.DB_LOG === 'true',
    }),
    EventsModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(delayMiddleware).forRoutes('*path');
  }
}
