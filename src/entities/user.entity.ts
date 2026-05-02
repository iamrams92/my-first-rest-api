import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { CartEntity } from './cart.entity.js';
import type { OrderEntity } from './order.entity.js';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ length: 120 })
  fullName: string;

  @Column({ unique: true, length: 120 })
  email: string;

  /** bcrypt hash — excluded from default SELECT; load explicitly where needed */
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  /** incremented on logout to invalidate outstanding JWT access tokens */
  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('CartEntity', 'user')
  carts: CartEntity[];

  @OneToMany('OrderEntity', 'user')
  orders: OrderEntity[];
}
