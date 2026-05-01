import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { OrderItemEntity } from './order-item.entity.js';
import type { PaymentEntity } from './payment.entity.js';
import type { UserEntity } from './user.entity.js';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type OrderPaymentStatus = 'PENDING' | 'PAID';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne('UserEntity', 'orders', { eager: true, nullable: false })
  user: UserEntity;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: OrderStatus;

  @Column({ type: 'varchar', default: 'PENDING' })
  paymentStatus: OrderPaymentStatus;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany('OrderItemEntity', 'order', { cascade: true, eager: true })
  items: OrderItemEntity[];

  @OneToMany('PaymentEntity', 'order')
  payments: PaymentEntity[];
}
