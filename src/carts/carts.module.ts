import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    UsersModule,
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
