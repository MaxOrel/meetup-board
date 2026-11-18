import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Введите почту целиком, например anna@example.com' })
  email: string;

  @IsString({ message: 'Укажите пароль' })
  @MinLength(1, { message: 'Укажите пароль' })
  password: string;
}
