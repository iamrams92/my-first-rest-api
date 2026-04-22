import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('productId') productId?: string) {
    let parsedProductId: number | undefined;

    if (productId !== undefined) {
      parsedProductId = Number(productId);

      if (!Number.isInteger(parsedProductId) || parsedProductId < 1) {
        throw new BadRequestException('productId must be a positive integer');
      }
    }

    return this.ordersService.findAll(parsedProductId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Get('product/:productId/transactions')
  getProductTransactions(@Param('productId', ParseIntPipe) productId: number) {
    return this.ordersService.getProductTransactions(productId);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
}
