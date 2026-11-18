import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min, MinLength, Matches } from 'class-validator';
import { CATEGORIES, FORMATS } from '../event.entity.js';
import type { Category, EventFormat } from '../event.entity.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// DTO — класс с декораторами. ValidationPipe проверяет по нему тело запроса,
// тот же класс — тип параметра в контроллере. Аналог Zod-схемы из server-express.
export class CreateEventDto {
  @Transform(trim)
  @IsString({ message: 'Укажите название' })
  @MinLength(3, { message: 'Название — от 3 символов' })
  @MaxLength(80, { message: 'Название — до 80 символов' })
  title: string;

  @IsISO8601({ strict: true }, { message: 'Дата в формате ISO 8601, например 2026-10-15T16:00:00Z' })
  date: string;

  @Transform(trim)
  @IsString({ message: 'Укажите город или «Онлайн»' })
  @MinLength(2, { message: 'Укажите город или «Онлайн»' })
  city: string;

  @IsIn(FORMATS, { message: 'Формат — online или offline' })
  format: EventFormat;

  @IsIn(CATEGORIES, { message: 'Неизвестная категория' })
  category: Category;

  @Transform(trim)
  @IsString({ message: 'Укажите спикера' })
  @MinLength(2, { message: 'Укажите спикера' })
  speaker: string;

  @IsInt({ message: 'Число мест — целое число' })
  @Min(1, { message: 'Мест должно быть больше нуля' })
  @Max(10000, { message: 'Не больше 10 000 мест' })
  seatsTotal: number;

  @IsOptional()
  @IsInt({ message: 'Занятые места — целое число' })
  @Min(0, { message: 'Не может быть меньше нуля' })
  seatsTaken?: number;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'Описание — текст' })
  @MaxLength(2000, { message: 'Описание — до 2000 символов' })
  description?: string;

  @IsString({ message: 'Укажите обложку' })
  @Matches(/^\/covers\//, { message: 'Обложка — путь вида /covers/frontend.svg' })
  cover: string;
}
