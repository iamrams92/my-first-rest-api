import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':runningNumber')
  findOne(@Param('runningNumber', ParseUUIDPipe) runningNumber: string) {
    return this.productsService.findOneWithQuantity(runningNumber);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':runningNumber')
  update(
    @Param('runningNumber', ParseUUIDPipe) runningNumber: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(runningNumber, updateProductDto);
  }

  @Delete(':runningNumber')
  remove(@Param('runningNumber', ParseUUIDPipe) runningNumber: string) {
    return this.productsService.remove(runningNumber);
  }
}
