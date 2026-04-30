import { generateUuid } from '../../utils/uuid.util';

export interface User {
  id: string;
  code: string;
  fullName: string;
  email: string;
  isActive: boolean;
}

export const usersDatabase: User[] = [
  {
    id: generateUuid(),
    code: 'USR-0001',
    fullName: 'Alice Johnson',
    email: 'alice@example.com',
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'USR-0002',
    fullName: 'Bob Smith',
    email: 'bob@example.com',
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'USR-0003',
    fullName: 'Charlie Brown',
    email: 'charlie@example.com',
    isActive: true,
  },
];

export let userCodeRunningNumber = usersDatabase.length + 1;
