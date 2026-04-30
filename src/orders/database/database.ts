import { generateUuid } from '../../utils/uuid.util';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type OrderPaymentStatus = 'PENDING' | 'PAID';

export interface Order {
  id: string;
  code: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  createdAt: string;
}

export const ordersDatabase: Order[] = [];

export let orderCodeRunningNumber = 1;

export function createOrderCode() {
  const code = `ORD-${orderCodeRunningNumber.toString().padStart(4, '0')}`;
  orderCodeRunningNumber += 1;
  return code;
}

export function makeOrder(params: {
  userId: string;
  totalAmount: number;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
}) {
  const order: Order = {
    id: generateUuid(),
    code: createOrderCode(),
    userId: params.userId,
    status: params.status ?? 'PENDING',
    paymentStatus: params.paymentStatus ?? 'PENDING',
    totalAmount: params.totalAmount,
    createdAt: new Date().toISOString(),
  };
  ordersDatabase.push(order);
  return order;
}
