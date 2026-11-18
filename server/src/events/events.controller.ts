import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { ListEventsQuery } from './dto/list-events.query.js';

// Контроллер — только HTTP: маршрут, параметры, код ответа.
// Проверку делает ValidationPipe по типам DTO, данные — сервис.
// id в Postgres — тип uuid. Строка другого вида не найдётся точно: сразу 404, не дёргая базу.
const EventId = Param('id', new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException('Событие не найдено') }));

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query() query: ListEventsQuery) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  findOne(@EventId id: string) {
    return this.eventsService.findOne(id);
  }

  // Читать может любой, менять афишу — только администратор
  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@EventId id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard, AdminGuard)
  remove(@EventId id: string) {
    return this.eventsService.remove(id);
  }
}
