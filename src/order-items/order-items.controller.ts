import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import { OrderItemsService } from './order-items.service';

@Controller('order-items')
@ApiBearerAuth()
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get('order/:orderId')
  @ApiParam({ name: 'orderId', example: 'fbb95f7e-1234-45ef-a6bc-1a2b3c4d5e6f' })
  findByOrderId(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.orderItemsService.findByOrderId(orderId);
  }
}
