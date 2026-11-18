import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { validationPipe } from './common/validation.js';

// Приложение со всеми настройками — одна функция и для запуска, и для e2e-тестов.
// Иначе тесты проверяли бы приложение без префикса, пайпов и фильтра ошибок.
export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: process.env.NODE_ENV === 'test' ? false : undefined });
  app.setGlobalPrefix('api/v1');
  // Helmet — набор заголовков безопасности: запрет встраивать ответы во фреймы, nosniff и другие
  app.use(helmet());
  app.enableCors({ origin: [/^http:\/\/localhost:\d+$/] });
  // Глобальный ValidationPipe: каждый @Body и @Query проверяется по своему DTO
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API: http://localhost:${port}/api/v1`);
}

// Vitest выставляет NODE_ENV=test: в тестах сервер не слушает порт, его запускает supertest
if (process.env.NODE_ENV !== 'test') await bootstrap();
