import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [ProductsModule, OrdersModule, CustomersModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
