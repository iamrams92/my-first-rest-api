import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Product,
  productCodeRunningNumber,
  productsDatabase,
} from './database/database';
import { ordersDatabase } from '../orders/database/database';
import { generateUuid } from '../utils/uuid.util';

@Injectable()
export class ProductsService {
  private codeRunningNumber = productCodeRunningNumber;

  create(createProductDto: CreateProductDto): Product {
    const codeSequence = this.codeRunningNumber++;
    const code = `PRD-${codeSequence.toString().padStart(4, '0')}`;

    const product: Product = {
      id: generateUuid(),
      code,
      name: createProductDto.name,
      category: createProductDto.category,
      price: createProductDto.price,
      isActive: createProductDto.isActive ?? true,
    };

    productsDatabase.push(product);
    return product;
  }

  findAll(query: FindProductsQueryDto) {
    const { page, size } = query;
    const totalItems = productsDatabase.length;
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const items = productsDatabase
      .slice(startIndex, startIndex + size)
      .map((product) => ({
        ...product,
        quantity: this.calculateProductQuantity(product.id),
      }));

    return {
      page,
      size,
      totalItems,
      totalPage,
      items,
    };
  }

  findOne(id: string): Product {
    const product = productsDatabase.find(
      (item) => item.id === id,
    );

    if (!product) {
      throw new NotFoundException(
        `Product with running number ${id} not found`,
      );
    }

    return product;
  }

  findOneWithQuantity(id: string) {
    const product = this.findOne(id);

    return {
      ...product,
      quantity: this.calculateProductQuantity(id),
    };
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);

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

  remove(id: string): Product {
    const index = productsDatabase.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      throw new NotFoundException(
        `Product with running number ${id} not found`,
      );
    }

    const [deletedProduct] = productsDatabase.splice(index, 1);
    return deletedProduct;
  }

  private calculateProductQuantity(productId: string): number {
    return ordersDatabase
      .filter((order) => order.productId === productId)
      .reduce((balance, order) => {
        if (order.transactionType === 'BUY') {
          return balance + order.quantity;
        }
        return balance - order.quantity;
      }, 0);
  }
}
