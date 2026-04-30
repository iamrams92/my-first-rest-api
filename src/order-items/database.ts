import { generateUuid } from '../utils/uuid.util';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const orderItemsDatabase: OrderItem[] = [];

export function createOrderItem(params: {
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}): OrderItem {
  const item: OrderItem = {
    id: generateUuid(),
    orderId: params.orderId,
    productId: params.productId,
    quantity: params.quantity,
    unitPrice: params.unitPrice,
    lineTotal: params.quantity * params.unitPrice,
  };
  orderItemsDatabase.push(item);
  return item;
}
