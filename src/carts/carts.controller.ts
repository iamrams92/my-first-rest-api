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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';

@Controller('carts')
@ApiBearerAuth()
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @Get(':cartId')
  @ApiParam({ name: 'cartId', example: '8e11198e-1234-4f67-b58f-e54a4b6b6011' })
  findOne(@Param('cartId', ParseUUIDPipe) cartId: string) {
    return this.cartsService.findOne(cartId);
  }

  @Post(':cartId/items')
  @ApiParam({ name: 'cartId', example: '8e11198e-1234-4f67-b58f-e54a4b6b6011' })
  addItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() body: UpsertCartItemDto,
  ) {
    return this.cartsService.addItem(cartId, body.productId, body.quantity);
  }

  @Patch(':cartId/items/:productId')
  @ApiParam({ name: 'cartId', example: '8e11198e-1234-4f67-b58f-e54a4b6b6011' })
  @ApiParam({ name: 'productId', example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33' })
  updateItemQuantity(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateCartItemQuantityDto,
  ) {
    return this.cartsService.updateItemQuantity(cartId, productId, body.quantity);
  }

  @Delete(':cartId/items/:productId')
  @ApiParam({ name: 'cartId', example: '8e11198e-1234-4f67-b58f-e54a4b6b6011' })
  @ApiParam({ name: 'productId', example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33' })
  removeItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartsService.removeItem(cartId, productId);
  }

  @Post(':cartId/checkout')
  @ApiParam({ name: 'cartId', example: '8e11198e-1234-4f67-b58f-e54a4b6b6011' })
  checkout(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() checkoutCartDto: CheckoutCartDto,
  ) {
    return this.cartsService.checkout(cartId, checkoutCartDto);
  }
}
