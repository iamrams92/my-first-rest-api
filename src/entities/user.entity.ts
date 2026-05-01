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

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('CartEntity', 'user')
  carts: CartEntity[];

  @OneToMany('OrderEntity', 'user')
  orders: OrderEntity[];
}
