import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateUuid } from '../utils/uuid.util';
import {
  User,
  userCodeRunningNumber,
  usersDatabase,
} from './database/database';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private codeRunningNumber = userCodeRunningNumber;

  create(createUserDto: CreateUserDto): User {
    this.assertUniqueEmail(createUserDto.email);
    const codeSequence = this.codeRunningNumber++;

    const user: User = {
      id: generateUuid(),
      code: `USR-${codeSequence.toString().padStart(4, '0')}`,
      fullName: createUserDto.fullName,
      email: createUserDto.email.toLowerCase(),
      isActive: createUserDto.isActive ?? true,
    };

    usersDatabase.push(user);
    return user;
  }

  findAll(query: FindUsersQueryDto) {
    const { page, size } = query;
    const totalItems = usersDatabase.length;
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const items = usersDatabase.slice(startIndex, startIndex + size);
    return { page, size, totalItems, totalPage, items };
  }

  findOne(id: string): User {
    const user = usersDatabase.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  findActiveOne(id: string): User {
    const user = this.findOne(id);
    if (!user.isActive) {
      throw new BadRequestException(`User ${id} is inactive`);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);
    if (updateUserDto.fullName !== undefined) {
      user.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.email !== undefined) {
      const nextEmail = updateUserDto.email.toLowerCase();
      this.assertUniqueEmail(nextEmail, id);
      user.email = nextEmail;
    }
    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }
    return user;
  }

  remove(id: string): User {
    const index = usersDatabase.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const [deleted] = usersDatabase.splice(index, 1);
    return deleted;
  }

  private assertUniqueEmail(email: string, currentUserId?: string) {
    const normalizedEmail = email.toLowerCase();
    const existing = usersDatabase.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.id !== currentUserId,
    );
    if (existing) {
      throw new BadRequestException(`User email ${email} already exists`);
    }
  }
}
