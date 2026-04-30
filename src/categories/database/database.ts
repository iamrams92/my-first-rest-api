import { generateUuid } from '../../utils/uuid.util';

export interface Category {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export const categoriesDatabase: Category[] = [
  {
    id: generateUuid(),
    code: 'CAT-0001',
    name: 'Electronics',
    isActive: true,
  },
  {
    id: generateUuid(),
    code: 'CAT-0002',
    name: 'Accessories',
    isActive: true,
  },
];

export let categoryCodeRunningNumber = categoriesDatabase.length + 1;
