import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsQueryDto } from './dto/find-payments-query.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@Query() query: FindPaymentsQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get('order/:orderId')
  @ApiParam({ name: 'orderId', example: 'fbb95f7e-1234-45ef-a6bc-1a2b3c4d5e6f' })
  findByOrderId(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }
}
