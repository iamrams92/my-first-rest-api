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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiParam } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':runningNumber')
  @ApiParam({
    name: 'runningNumber',
    example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33',
  })
  findOne(@Param('runningNumber', ParseUUIDPipe) runningNumber: string) {
    return this.productsService.findOneWithQuantity(runningNumber);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':runningNumber')
  @ApiParam({
    name: 'runningNumber',
    example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33',
  })
  update(
    @Param('runningNumber', ParseUUIDPipe) runningNumber: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(runningNumber, updateProductDto);
  }

  @Delete(':runningNumber')
  @ApiParam({
    name: 'runningNumber',
    example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33',
  })
  remove(@Param('runningNumber', ParseUUIDPipe) runningNumber: string) {
    return this.productsService.remove(runningNumber);
  }
}
