import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @Get(':cartId')
  findOne(@Param('cartId', ParseUUIDPipe) cartId: string) {
    return this.cartsService.findOne(cartId);
  }

  @Post(':cartId/items')
  addItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() body: UpsertCartItemDto,
  ) {
    return this.cartsService.addItem(cartId, body.productId, body.quantity);
  }

  @Patch(':cartId/items/:productId')
  updateItemQuantity(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateCartItemQuantityDto,
  ) {
    return this.cartsService.updateItemQuantity(cartId, productId, body.quantity);
  }

  @Delete(':cartId/items/:productId')
  removeItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartsService.removeItem(cartId, productId);
  }

  @Post(':cartId/checkout')
  checkout(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() checkoutCartDto: CheckoutCartDto,
  ) {
    return this.cartsService.checkout(cartId, checkoutCartDto);
  }
}
