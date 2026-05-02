import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CartItemEntity } from './cart-item.entity.js';
import type { CategoryEntity } from './category.entity.js';
import type { OrderItemEntity } from './order-item.entity.js';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ length: 120 })
  name: string;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('CategoryEntity', 'products', {
    eager: true,
    nullable: true,
  })
  category: CategoryEntity;

  @OneToMany('CartItemEntity', 'product')
  cartItems: CartItemEntity[];

  @OneToMany('OrderItemEntity', 'product')
  orderItems: OrderItemEntity[];
}
