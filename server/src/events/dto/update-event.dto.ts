import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto.js';

// PATCH: те же правила, но каждое поле необязательно
export class UpdateEventDto extends PartialType(CreateEventDto) {}
