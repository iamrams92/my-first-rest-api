import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { CartItemEntity } from './cart-item.entity.js';
import type { UserEntity } from './user.entity.js';

export type CartStatus = 'ACTIVE' | 'CHECKED_OUT';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('UserEntity', 'carts', { eager: true, nullable: false })
  user: UserEntity;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: CartStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkedOutAt?: Date;

  @OneToMany('CartItemEntity', 'cart', { cascade: true, eager: true })
  items: CartItemEntity[];
}
