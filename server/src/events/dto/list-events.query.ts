import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CATEGORIES, FORMATS } from '../event.entity.js';
import type { Category, EventFormat } from '../event.entity.js';

// Query-параметры приходят строками: @Type(() => Number) превращает их в числа
export class ListEventsQuery {
  @IsOptional()
  @IsIn(CATEGORIES, { message: 'Неизвестная категория' })
  category?: Category;

  @IsOptional()
  @IsIn(FORMATS, { message: 'Формат — online или offline' })
  format?: EventFormat;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() ? value.trim() : undefined))
  @IsString()
  @MaxLength(100, { message: 'Запрос — до 100 символов' })
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Страница — от 1' })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'Не больше 100 событий за раз' })
  limit = 12;
}
