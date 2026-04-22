export interface Product {
  runningNumber: number;
  code: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

export const productsDatabase: Product[] = [];

export let productRunningNumber = 1;
