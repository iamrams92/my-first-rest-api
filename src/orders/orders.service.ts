import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
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

  constructor(
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  create(createOrderDto: CreateOrderDto): Order {
    const product = this.productsService.findOne(createOrderDto.productId);
    let customerId: string | undefined;

    if (createOrderDto.transactionType === 'SELL') {
      if (!createOrderDto.customerId) {
        throw new BadRequestException(
          'customerId is required for SELL transactions',
        );
      }

      const customer = this.customersService.findActiveOne(
        createOrderDto.customerId,
      );
      customerId = customer.id;
      this.productsService.validateProductForSale(
        createOrderDto.productId,
        createOrderDto.quantity,
      );
    }

    const codeSequence = this.codeRunningNumber++;

    const order: Order = {
      id: generateUuid(),
      code: `ORD-${codeSequence.toString().padStart(4, '0')}`,
      productId: product.id,
      customerId,
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

  getProductTransactions(productId: string) {
    this.productsService.findOne(productId);

    const orders = ordersDatabase.filter(
      (order) => order.productId === productId,
    );

    return {
      productId,
      totalTransactions: orders.length,
      orders: orders.map((order) => this.buildOrderView(order)),
    };
  }

  private buildOrderView(order: Order) {
    if (!order.customerId) {
      return {
        ...order,
        customer: null,
      };
    }

    const customer = this.customersService.findOne(order.customerId);
    return {
      ...order,
      customer: {
        id: customer.id,
        code: customer.code,
        fullName: customer.fullName,
        email: customer.email,
      },
    };
  }
}
