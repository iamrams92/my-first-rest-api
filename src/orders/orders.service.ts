import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { orderRunningId, Order, ordersDatabase } from './database/database';

@Injectable()
export class OrdersService {
  private runningId = orderRunningId;

  constructor(private readonly productsService: ProductsService) {}

  create(createOrderDto: CreateOrderDto): Order {
    const product = this.productsService.findOne(createOrderDto.productId);

    const order: Order = {
      id: this.runningId++,
      productId: product.runningNumber,
      transactionType: createOrderDto.transactionType,
      quantity: createOrderDto.quantity,
      unitPrice: product.price,
      totalPrice: product.price * createOrderDto.quantity,
      createdAt: new Date().toISOString(),
    };

    ordersDatabase.push(order);
    return order;
  }

  findAll(productId?: number): Order[] {
    if (productId === undefined) {
      return ordersDatabase;
    }

    this.productsService.findOne(productId);
    return ordersDatabase.filter((order) => order.productId === productId);
  }

  findOne(id: number): Order {
    const order = ordersDatabase.find((order) => order.id === id);

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  getProductTransactions(productId: number) {
    this.productsService.findOne(productId);

    const orders = ordersDatabase.filter(
      (order) => order.productId === productId,
    );

    return {
      productId,
      totalTransactions: orders.length,
      orders,
    };
  }
}
