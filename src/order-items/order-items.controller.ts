import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';

@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get('order/:orderId')
  findByOrderId(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.orderItemsService.findByOrderId(orderId);
  }
}
