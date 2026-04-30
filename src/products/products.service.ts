import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Product,
  productCodeRunningNumber,
  productsDatabase,
} from './database/database';
import { generateUuid } from '../utils/uuid.util';

@Injectable()
export class ProductsService {
  private codeRunningNumber = productCodeRunningNumber;
  constructor(private readonly categoriesService: CategoriesService) {}

  create(createProductDto: CreateProductDto): Product {
    this.categoriesService.findOne(createProductDto.categoryId);
    const codeSequence = this.codeRunningNumber++;
    const code = `PRD-${codeSequence.toString().padStart(4, '0')}`;

    const product: Product = {
      id: generateUuid(),
      code,
      name: createProductDto.name,
      categoryId: createProductDto.categoryId,
      price: createProductDto.price,
      stock: createProductDto.stock,
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
        category: this.categoriesService.findOne(product.categoryId),
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
      quantity: product.stock,
      category: this.categoriesService.findOne(product.categoryId),
    };
  }

  getAvailableQuantity(productId: string): number {
    return this.findOne(productId).stock;
  }

  validateProductForSale(productId: string, quantity: number) {
    const product = this.findOne(productId);
    if (!product.isActive) {
      throw new BadRequestException(`Product ${productId} is inactive`);
    }

    const availableQuantity = product.stock;
    if (quantity > availableQuantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${availableQuantity}, requested: ${quantity}`,
      );
    }
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.categoryId !== undefined) {
      this.categoriesService.findOne(updateProductDto.categoryId);
      product.categoryId = updateProductDto.categoryId;
    }
    if (updateProductDto.price !== undefined) {
      product.price = updateProductDto.price;
    }
    if (updateProductDto.isActive !== undefined) {
      product.isActive = updateProductDto.isActive;
    }
    if (updateProductDto.stock !== undefined) {
      product.stock = updateProductDto.stock;
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

  decreaseStock(productId: string, quantity: number) {
    const product = this.findOne(productId);
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${product.stock}, requested: ${quantity}`,
      );
    }
    product.stock -= quantity;
  }

  increaseStock(productId: string, quantity: number) {
    const product = this.findOne(productId);
    product.stock += quantity;
  }
}
