import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { ProductEntity } from './product.entity.js';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ length: 80 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('ProductEntity', 'category')
  products: ProductEntity[];
}
