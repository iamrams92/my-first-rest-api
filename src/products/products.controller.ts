import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':runningNumber')
  findOne(@Param('runningNumber', ParseIntPipe) runningNumber: number) {
    return this.productsService.findOne(runningNumber);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':runningNumber')
  update(
    @Param('runningNumber', ParseIntPipe) runningNumber: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(runningNumber, updateProductDto);
  }

  @Delete(':runningNumber')
  remove(@Param('runningNumber', ParseIntPipe) runningNumber: number) {
    return this.productsService.remove(runningNumber);
  }
}
