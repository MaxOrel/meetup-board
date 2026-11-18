import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

// Пароль в базе не храним — только его хеш с солью (auth/password.ts)
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 60 })
  name: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: ROLES, default: 'user' })
  role: Role;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

// Пользователь в ответах API: без хеша пароля и служебных полей
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function toPublicUser({ id, email, name, role }: UserEntity): PublicUser {
  return { id, email, name, role };
}
