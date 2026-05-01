import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.ordersService.findOneRaw(createPaymentDto.orderId);
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException(`Order ${order.id} is already paid`);
    }
    if (createPaymentDto.amount < order.totalAmount) {
      throw new BadRequestException(
        `Payment amount must be at least ${order.totalAmount}`,
      );
    }

    const sequence = (await this.paymentsRepository.count()) + 1;
    const payment = this.paymentsRepository.create({
      code: `PAY-${sequence.toString().padStart(4, '0')}`,
      order,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: 'PAID',
      paidAt: new Date(),
    });
    const savedPayment = await this.paymentsRepository.save(payment);

    await this.ordersService.markAsPaid(order.id);
    return savedPayment;
  }

  findAll() {
    return this.paymentsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByOrderId(orderId: string) {
    return this.paymentsRepository.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
  }
}
