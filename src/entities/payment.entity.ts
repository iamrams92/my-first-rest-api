import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { OrderEntity } from './order.entity.js';

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne('OrderEntity', 'payments', {
    eager: true,
    nullable: false,
  })
  order: OrderEntity;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  method: PaymentMethod;

  @Column({ type: 'varchar', default: 'PAID' })
  status: PaymentStatus;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
