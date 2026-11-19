import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity.js';

// Почту храним в нижнем регистре: Maria@Example.com и maria@example.com — один аккаунт
@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly users: Repository<UserEntity>) {}

  findByEmail(email: string) {
    return this.users.findOneBy({ email: email.toLowerCase() });
  }

  findById(id: string) {
    return this.users.findOneBy({ id });
  }

  create(data: Pick<UserEntity, 'email' | 'name' | 'passwordHash'> & Partial<Pick<UserEntity, 'role'>>) {
    return this.users.save(this.users.create({ ...data, email: data.email.toLowerCase() }));
  }
}
