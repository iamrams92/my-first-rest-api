import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [ProductsModule, OrdersModule, UsersModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
