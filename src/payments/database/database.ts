import { generateUuid } from '../../utils/uuid.util';

export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
  id: string;
  code: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export const paymentsDatabase: Payment[] = [];
export let paymentCodeRunningNumber = 1;

export function createPaymentCode() {
  const code = `PAY-${paymentCodeRunningNumber.toString().padStart(4, '0')}`;
  paymentCodeRunningNumber += 1;
  return code;
}

export function makePayment(params: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
}) {
  const status = params.status ?? 'PAID';
  const payment: Payment = {
    id: generateUuid(),
    code: createPaymentCode(),
    orderId: params.orderId,
    amount: params.amount,
    method: params.method,
    status,
    paidAt: status === 'PAID' ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
  };
  paymentsDatabase.push(payment);
  return payment;
}
