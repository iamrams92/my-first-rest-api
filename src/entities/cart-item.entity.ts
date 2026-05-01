import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { CartEntity } from './cart.entity.js';
import type { ProductEntity } from './product.entity.js';

@Entity('cart_items')
@Unique(['cart', 'product'])
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('CartEntity', 'items', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  cart: CartEntity;

  @ManyToOne('ProductEntity', 'cartItems', {
    eager: true,
    nullable: false,
  })
  product: ProductEntity;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;
}
