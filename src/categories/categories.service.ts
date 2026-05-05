import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const codeSequence = (await this.categoriesRepository.count()) + 1;
    const category = this.categoriesRepository.create({
      code: `CAT-${codeSequence.toString().padStart(4, '0')}`,
      name: createCategoryDto.name,
      isActive: createCategoryDto.isActive ?? true,
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(query: FindCategoriesQueryDto) {
    const { page, size } = query;
    const [items, totalItems] = await this.categoriesRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { name: 'ASC' },
    });
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    return { page, size, totalItems, totalPage, items };
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }
    if (updateCategoryDto.isActive !== undefined) {
      category.isActive = updateCategoryDto.isActive;
    }
    return this.categoriesRepository.save(category);
  }
}
