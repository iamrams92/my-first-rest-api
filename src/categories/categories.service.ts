import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateUuid } from '../utils/uuid.util';
import {
  categoriesDatabase,
  Category,
  categoryCodeRunningNumber,
} from './database/database';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private codeRunningNumber = categoryCodeRunningNumber;

  create(createCategoryDto: CreateCategoryDto): Category {
    const codeSequence = this.codeRunningNumber++;
    const category: Category = {
      id: generateUuid(),
      code: `CAT-${codeSequence.toString().padStart(4, '0')}`,
      name: createCategoryDto.name,
      isActive: createCategoryDto.isActive ?? true,
    };
    categoriesDatabase.push(category);
    return category;
  }

  findAll() {
    return categoriesDatabase;
  }

  findOne(id: string): Category {
    const category = categoriesDatabase.find((item) => item.id === id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto): Category {
    const category = this.findOne(id);
    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name;
    }
    if (updateCategoryDto.isActive !== undefined) {
      category.isActive = updateCategoryDto.isActive;
    }
    return category;
  }
}
