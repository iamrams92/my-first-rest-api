import { generateUuid } from '../../utils/uuid.util';

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export const customersDatabase: Customer[] = [
  {
    id: generateUuid(),
    code: 'CUS-0001',
    fullName: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '0811111111',
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'CUS-0002',
    fullName: 'Bob Smith',
    email: 'bob@example.com',
    phone: '0822222222',
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'CUS-0003',
    fullName: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '0833333333',
    isActive: true,
  },
];

export let customerCodeRunningNumber = customersDatabase.length + 1;
