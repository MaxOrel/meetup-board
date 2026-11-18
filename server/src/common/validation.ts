import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

function flatten(errors: ValidationError[], parent = ''): { field: string; message: string }[] {
  return errors.flatMap((e) => {
    const field = parent ? `${parent}.${e.property}` : e.property;
    const own = Object.values(e.constraints ?? {}).map((message) => ({ field, message }));
    return [...own, ...flatten(e.children ?? [], field)];
  });
}

// Ошибки валидации → 400 { message: 'Ошибка валидации', errors: [{ field, message }] }
export const validationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  stopAtFirstError: true, // одно сообщение на поле — удобно для формы
  exceptionFactory: (errors) => new BadRequestException({ message: 'Ошибка валидации', errors: flatten(errors) }),
});
