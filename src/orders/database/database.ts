import { seededProductIds } from '../../products/database/database';
import { generateUuid } from '../../utils/uuid.util';

export type TransactionType = 'BUY' | 'SELL';

export interface Order {
  id: string;
  code: string;
  productId: string;
  customerId?: string;
  transactionType: TransactionType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export const ordersDatabase: Order[] = [
  {
    id: generateUuid(),
    code: 'ORD-0001',
    productId: seededProductIds.first,
    transactionType: 'BUY',
    quantity: 10,
    unitPrice: 100,
    totalPrice: 1000,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateUuid(),
    code: 'ORD-0002',
    productId: seededProductIds.second,
    transactionType: 'BUY',
    quantity: 20,
    unitPrice: 200,
    totalPrice: 4000,
    createdAt: new Date().toISOString(),
  },
  {
    id: generateUuid(),
    code: 'ORD-0003',
    productId: seededProductIds.second,
    transactionType: 'SELL',
    quantity: 2,
    unitPrice: 200,
    totalPrice: 4000,
    createdAt: new Date().toISOString(),
  },
];

export let orderCodeRunningNumber = ordersDatabase.length + 1;
