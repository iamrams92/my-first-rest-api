import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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
    const passwordHash =
      createUserDto.password !== undefined
        ? await bcrypt.hash(createUserDto.password, 10)
        : null;
    const user = this.usersRepository.create({
      code: `USR-${codeSequence.toString().padStart(4, '0')}`,
      fullName: createUserDto.fullName,
      email: createUserDto.email.toLowerCase(),
      isActive: createUserDto.isActive ?? true,
      passwordHash,
    });
    return this.usersRepository.save(user);
  }

  /** Used by JwtStrategy — active user including current token revision */
  async findActiveForAuth(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user?.isActive) {
      throw new UnauthorizedException('User inactive or unknown');
    }
    return user;
  }

  async validateCredentials(email: string, plainPassword: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalized },
      select: [
        'id',
        'code',
        'fullName',
        'email',
        'isActive',
        'passwordHash',
        'tokenVersion',
      ],
    });
    if (!user?.isActive || user.passwordHash == null) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /** Server-side revocation: JWT `tv` no longer matches */
  async invalidateTokens(userId: string): Promise<void> {
    await this.findOne(userId);
    await this.usersRepository.increment({ id: userId }, 'tokenVersion', 1);
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
