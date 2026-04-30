import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { orderItemsDatabase } from './database';

@Injectable()
export class OrderItemsService {
  constructor(private readonly productsService: ProductsService) {}

  findByOrderId(orderId: string) {
    return orderItemsDatabase
      .filter((item) => item.orderId === orderId)
      .map((item) => ({
        ...item,
        product: this.productsService.findOne(item.productId),
      }));
  }
}
