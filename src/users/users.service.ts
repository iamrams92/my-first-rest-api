import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    await this.assertUniqueEmail(createUserDto.email);
    const codeSequence = (await this.usersRepository.count()) + 1;
    const user = this.usersRepository.create({
      code: `USR-${codeSequence.toString().padStart(4, '0')}`,
      fullName: createUserDto.fullName,
      email: createUserDto.email.toLowerCase(),
      isActive: createUserDto.isActive ?? true,
    });
    return this.usersRepository.save(user);
  }

  async findAll(query: FindUsersQueryDto) {
    const { page, size } = query;
    const [items, totalItems] = await this.usersRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { fullName: 'ASC' },
    });
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    return { page, size, totalItems, totalPage, items };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findActiveOne(id: string): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (!user.isActive) {
      throw new BadRequestException(`User ${id} is inactive`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (updateUserDto.fullName !== undefined) {
      user.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.email !== undefined) {
      const nextEmail = updateUserDto.email.toLowerCase();
      await this.assertUniqueEmail(nextEmail, id);
      user.email = nextEmail;
    }
    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<UserEntity> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return user;
  }

  private async assertUniqueEmail(email: string, currentUserId?: string) {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();

    if (existing && existing.id !== currentUserId) {
      throw new BadRequestException(`User email ${email} already exists`);
    }
  }
}
