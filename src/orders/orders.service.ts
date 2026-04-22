import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  orderCodeRunningNumber,
  Order,
  ordersDatabase,
} from './database/database';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { generateUuid } from '../utils/uuid.util';

@Injectable()
export class OrdersService {
  private codeRunningNumber = orderCodeRunningNumber;

  constructor(private readonly productsService: ProductsService) {}

  create(createOrderDto: CreateOrderDto): Order {
    const product = this.productsService.findOne(createOrderDto.productId);
    const codeSequence = this.codeRunningNumber++;

    const order: Order = {
      id: generateUuid(),
      code: `ORD-${codeSequence.toString().padStart(4, '0')}`,
      productId: product.id,
      transactionType: createOrderDto.transactionType,
      quantity: createOrderDto.quantity,
      unitPrice: product.price,
      totalPrice: product.price * createOrderDto.quantity,
      createdAt: new Date().toISOString(),
    };

    ordersDatabase.push(order);
    return order;
  }

  findAll(query: FindOrdersQueryDto) {
    const { productId, page, size } = query;

    let filteredOrders = ordersDatabase;
    if (productId !== undefined) {
      this.productsService.findOne(productId);
      filteredOrders = ordersDatabase.filter(
        (order) => order.productId === productId,
      );
    }

    const totalItems = filteredOrders.length;
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const items = filteredOrders.slice(startIndex, startIndex + size);

    return {
      page,
      size,
      totalItems,
      totalPage,
      items,
    };
  }

  findOne(id: string): Order {
    const order = ordersDatabase.find((order) => order.id === id);

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  getProductTransactions(productId: string) {
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
