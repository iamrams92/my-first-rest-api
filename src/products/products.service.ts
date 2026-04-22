import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Product,
  productRunningNumber,
  productsDatabase,
} from './database/database';

@Injectable()
export class ProductsService {
  private runningNumber = productRunningNumber;

  create(createProductDto: CreateProductDto): Product {
    const runningNumber = this.runningNumber++;
    const code = `PRD-${runningNumber.toString().padStart(4, '0')}`;

    const product: Product = {
      runningNumber,
      code,
      name: createProductDto.name,
      category: createProductDto.category,
      price: createProductDto.price,
      isActive: createProductDto.isActive ?? true,
    };

    productsDatabase.push(product);
    return product;
  }

  findAll(): Product[] {
    return productsDatabase;
  }

  findOne(runningNumber: number): Product {
    const product = productsDatabase.find(
      (item) => item.runningNumber === runningNumber,
    );

    if (!product) {
      throw new NotFoundException(
        `Product with running number ${runningNumber} not found`,
      );
    }

    return product;
  }

  update(runningNumber: number, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(runningNumber);

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.category !== undefined) {
      product.category = updateProductDto.category;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }
    if (updateProductDto.isActive !== undefined) {
      product.isActive = updateProductDto.isActive;
    }

    return product;
  }

  remove(runningNumber: number): Product {
    const index = productsDatabase.findIndex(
      (item) => item.runningNumber === runningNumber,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Product with running number ${runningNumber} not found`,
      );
    }

    const [deletedProduct] = productsDatabase.splice(index, 1);
    return deletedProduct;
  }
}
