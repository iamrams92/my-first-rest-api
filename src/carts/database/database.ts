export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type CartStatus = 'ACTIVE' | 'CHECKED_OUT';

export interface Cart {
  id: string;
  customerId: string;
  status: CartStatus;
  items: CartItem[];
  createdAt: string;
  checkedOutAt?: string;
}

export const cartsDatabase: Cart[] = [];
