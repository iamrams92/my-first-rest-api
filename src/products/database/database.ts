import { generateUuid } from '../../utils/uuid.util';
import { categoriesDatabase } from '../../categories/database/database';

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export const seededProductIds = {
  first: generateUuid(),
  second: generateUuid(),
};

export const productsDatabase: Product[] = [
  {
    id: generateUuid(),
    code: 'PRD-0001',
    name: 'Product 1',
    categoryId: categoriesDatabase[0].id,
    price: 100,
    stock: 10,
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'PRD-0002',
    name: 'Product 2',
    categoryId: categoriesDatabase[1].id,
    price: 200,
    stock: 18,
    isActive: true,
  },
];

export let productCodeRunningNumber = productsDatabase.length + 1;
