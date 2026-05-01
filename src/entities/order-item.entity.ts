import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { OrderEntity } from './order.entity.js';
import type { ProductEntity } from './product.entity.js';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('OrderEntity', 'items', {
    onDelete: 'CASCADE',
    nullable: false,
  })
  order: OrderEntity;

  @ManyToOne('ProductEntity', 'orderItems', {
    eager: true,
    nullable: false,
  })
  product: ProductEntity;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  lineTotal: number;
}
