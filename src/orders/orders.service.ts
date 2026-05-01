import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const user = await this.usersService.findActiveOne(createOrderDto.userId);

    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.validateProductForSale(product.id, item.quantity);
      totalAmount += product.price * item.quantity;
    }

    const sequence = (await this.ordersRepository.count()) + 1;
    const order = this.ordersRepository.create({
      code: `ORD-${sequence.toString().padStart(4, '0')}`,
      user,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });
    const savedOrder = await this.ordersRepository.save(order);

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.decreaseStock(product.id, item.quantity);
      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        product,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(query: FindOrdersQueryDto) {
    const { userId, page, size } = query;
    const where = userId
      ? { user: { id: (await this.usersService.findOne(userId)).id } }
      : {};
    const [items, totalItems] = await this.ordersRepository.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);

    return {
      page,
      size,
      totalItems,
      totalPage,
      items: await Promise.all(items.map((order) => this.buildOrderView(order))),
    };
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.buildOrderView(order);
  }

  async findOneRaw(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async markAsPaid(orderId: string) {
    const order = await this.findOneRaw(orderId);
    order.paymentStatus = 'PAID';
    order.status = 'PAID';
    return this.ordersRepository.save(order);
  }

  private async buildOrderView(order: OrderEntity) {
    const items = await this.orderItemsRepository.find({
      where: { order: { id: order.id } },
      order: { id: 'ASC' },
    });
    return {
      ...order,
      items,
    };
  }
}
