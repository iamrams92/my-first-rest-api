export type TransactionType = 'BUY' | 'SELL';

export interface Order {
  id: number;
  productId: number;
  transactionType: TransactionType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export const ordersDatabase: Order[] = [
  {
    id: 1,
    productId: 1,
    transactionType: 'BUY',
    quantity: 10,
    unitPrice: 100,
    totalPrice: 1000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    productId: 2,
    transactionType: 'SELL',
    quantity: 20,
    unitPrice: 200,
    totalPrice: 4000,
    createdAt: new Date().toISOString(),
  },
];

export let orderRunningId = ordersDatabase.length + 1;
