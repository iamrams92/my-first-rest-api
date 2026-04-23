import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  customerCodeRunningNumber,
  Customer,
  customersDatabase,
} from './database/database';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { FindCustomersQueryDto } from './dto/find-customers-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { generateUuid } from '../utils/uuid.util';

@Injectable()
export class CustomersService {
  private codeRunningNumber = customerCodeRunningNumber;

  create(createCustomerDto: CreateCustomerDto): Customer {
    this.assertUniqueEmail(createCustomerDto.email);

    const codeSequence = this.codeRunningNumber++;
    const customer: Customer = {
      id: generateUuid(),
      code: `CUS-${codeSequence.toString().padStart(4, '0')}`,
      fullName: createCustomerDto.fullName,
      email: createCustomerDto.email.toLowerCase(),
      phone: createCustomerDto.phone,
      isActive: createCustomerDto.isActive ?? true,
    };

    customersDatabase.push(customer);
    return customer;
  }

  findAll(query: FindCustomersQueryDto) {
    const { page, size } = query;
    const totalItems = customersDatabase.length;
    const totalPage = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const items = customersDatabase.slice(startIndex, startIndex + size);

    return {
      page,
      size,
      totalItems,
      totalPage,
      items,
    };
  }

  findOne(id: string): Customer {
    const customer = customersDatabase.find((item) => item.id === id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }

  findActiveOne(id: string): Customer {
    const customer = this.findOne(id);
    if (!customer.isActive) {
      throw new BadRequestException(`Customer ${id} is inactive`);
    }
    return customer;
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto): Customer {
    const customer = this.findOne(id);
    if (updateCustomerDto.email !== undefined) {
      const nextEmail = updateCustomerDto.email.toLowerCase();
      this.assertUniqueEmail(nextEmail, id);
      customer.email = nextEmail;
    }
    if (updateCustomerDto.fullName !== undefined) {
      customer.fullName = updateCustomerDto.fullName;
    }
    if (updateCustomerDto.phone !== undefined) {
      customer.phone = updateCustomerDto.phone;
    }
    if (updateCustomerDto.isActive !== undefined) {
      customer.isActive = updateCustomerDto.isActive;
    }
    return customer;
  }

  remove(id: string): Customer {
    const index = customersDatabase.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    const [deletedCustomer] = customersDatabase.splice(index, 1);
    return deletedCustomer;
  }

  private assertUniqueEmail(email: string, currentCustomerId?: string) {
    const normalizedEmail = email.toLowerCase();
    const existingCustomer = customersDatabase.find(
      (customer) =>
        customer.email.toLowerCase() === normalizedEmail &&
        customer.id !== currentCustomerId,
    );

    if (existingCustomer) {
      throw new BadRequestException(`Customer email ${email} already exists`);
    }
  }
}
