import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  Order,
  makeOrder,
  ordersDatabase,
} from './database/database';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { createOrderItem, orderItemsDatabase } from '../order-items/database';

@Injectable()
export class OrdersService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    const user = this.usersService.findActiveOne(createOrderDto.userId);

    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = this.productsService.findOne(item.productId);
      this.productsService.validateProductForSale(product.id, item.quantity);
      totalAmount += product.price * item.quantity;
    }

    const order = makeOrder({
      userId: user.id,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    for (const item of createOrderDto.items) {
      const product = this.productsService.findOne(item.productId);
      this.productsService.decreaseStock(product.id, item.quantity);
      createOrderItem({
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    return this.buildOrderView(order);
  }

  findAll(query: FindOrdersQueryDto) {
    const { userId, page, size } = query;

    let filteredOrders = ordersDatabase;
    if (userId !== undefined) {
      this.usersService.findOne(userId);
      filteredOrders = ordersDatabase.filter((order) => order.userId === userId);
    }

    const totalItems = filteredOrders.length;
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const items = filteredOrders
      .slice(startIndex, startIndex + size)
      .map((order) => this.buildOrderView(order));

    return {
      page,
      size,
      totalItems,
      totalPage,
      items,
    };
  }

  findOne(id: string) {
    const order = ordersDatabase.find((order) => order.id === id);

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.buildOrderView(order);
  }

  findOneRaw(id: string): Order {
    const order = ordersDatabase.find((item) => item.id === id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  markAsPaid(orderId: string) {
    const order = this.findOneRaw(orderId);
    order.paymentStatus = 'PAID';
    order.status = 'PAID';
    return order;
  }

  private buildOrderView(order: Order) {
    const user = this.usersService.findOne(order.userId);
    const items = orderItemsDatabase.filter((item) => item.orderId === order.id);
    return {
      ...order,
      user: {
        id: user.id,
        code: user.code,
        fullName: user.fullName,
        email: user.email,
      },
      items,
    };
  }
}
