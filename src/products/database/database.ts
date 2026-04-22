import { generateUuid } from '../../utils/uuid.util';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

export const seededProductIds = {
  first: generateUuid(),
  second: generateUuid(),
};

export const productsDatabase: Product[] = [
  {
    id: seededProductIds.first,
    code: 'PRD-0001',
    name: 'Product 1',
    category: 'Category 1',
    price: 100,
    isActive: true,
  },
  {
    id: seededProductIds.second,
    code: 'PRD-0002',
    name: 'Product 2',
    category: 'Category 2',
    price: 200,
    isActive: true,
  },
];

export let productCodeRunningNumber = productsDatabase.length + 1;
