import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @Transform(trim)
  @IsString({ message: 'Укажите имя' })
  @MinLength(2, { message: 'Имя — от 2 символов' })
  @MaxLength(60, { message: 'Имя — до 60 символов' })
  name: string;

  @Transform(trim)
  @IsEmail({}, { message: 'Введите почту целиком, например anna@example.com' })
  email: string;

  @IsString({ message: 'Укажите пароль' })
  @MinLength(8, { message: 'Пароль — не короче 8 символов' })
  @MaxLength(72, { message: 'Пароль — до 72 символов' })
  password: string;
}
