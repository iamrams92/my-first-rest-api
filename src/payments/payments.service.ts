import { BadRequestException, Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { makePayment, paymentsDatabase } from './database/database';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly ordersService: OrdersService) {}

  create(createPaymentDto: CreatePaymentDto) {
    const order = this.ordersService.findOneRaw(createPaymentDto.orderId);
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException(`Order ${order.id} is already paid`);
    }
    if (createPaymentDto.amount < order.totalAmount) {
      throw new BadRequestException(
        `Payment amount must be at least ${order.totalAmount}`,
      );
    }

    const payment = makePayment({
      orderId: createPaymentDto.orderId,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: 'PAID',
    });

    this.ordersService.markAsPaid(order.id);
    return payment;
  }

  findAll() {
    return paymentsDatabase;
  }

  findByOrderId(orderId: string) {
    return paymentsDatabase.filter((payment) => payment.orderId === orderId);
  }
}
