import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { ProductEntity } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const category = await this.categoriesService.findOne(createProductDto.categoryId);
    const codeSequence = (await this.productsRepository.count()) + 1;
    const product = this.productsRepository.create({
      code: `PRD-${codeSequence.toString().padStart(4, '0')}`,
      name: createProductDto.name,
      category,
      price: createProductDto.price,
      stock: createProductDto.stock,
      isActive: createProductDto.isActive ?? true,
    });
    return this.productsRepository.save(product);
  }

  async findAll(query: FindProductsQueryDto) {
    const { page, size } = query;
    const [items, totalItems] = await this.productsRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { name: 'ASC' },
    });
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);

    return {
      page,
      size,
      totalItems,
      totalPage,
      items,
    };
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(
        `Product with running number ${id} not found`,
      );
    }

    return product;
  }

  async findOneWithQuantity(id: string) {
    const product = await this.findOne(id);
    return {
      ...product,
      quantity: product.stock,
    };
  }

  async getAvailableQuantity(productId: string): Promise<number> {
    return (await this.findOne(productId)).stock;
  }

  async validateProductForSale(productId: string, quantity: number) {
    const product = await this.findOne(productId);
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    if (updateProductDto.name !== undefined) {
      product.name = updateProductDto.name;
    }
    if (updateProductDto.categoryId !== undefined) {
      product.category = await this.categoriesService.findOne(
        updateProductDto.categoryId,
      );
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

    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<ProductEntity> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return product;
  }

  async decreaseStock(productId: string, quantity: number) {
    const product = await this.findOne(productId);
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${product.stock}, requested: ${quantity}`,
      );
    }
    product.stock -= quantity;
    await this.productsRepository.save(product);
  }

  async increaseStock(productId: string, quantity: number) {
    const product = await this.findOne(productId);
    product.stock += quantity;
    await this.productsRepository.save(product);
  }
}
