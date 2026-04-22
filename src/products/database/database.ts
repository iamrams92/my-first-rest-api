export interface Product {
  runningNumber: number;
  code: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

export const productsDatabase: Product[] = [
  {
    runningNumber: 1,
    code: 'PRD-0001',
    name: 'Product 1',
    category: 'Category 1',
    price: 100,
    isActive: true,
  },
  {
    runningNumber: 2,
    code: 'PRD-0002',
    name: 'Product 2',
    category: 'Category 2',
    price: 200,
    isActive: true,
  },
];

export let productRunningNumber = productsDatabase.length + 1;
