import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { EventEntity } from './event.entity.js';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
import { SeedService } from './seed.service.js';

// Модуль собирает всё, что относится к событиям: репозиторий таблицы, контроллер, сервисы
@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), AuthModule],
  controllers: [EventsController],
  providers: [EventsService, SeedService],
})
export class EventsModule {}
