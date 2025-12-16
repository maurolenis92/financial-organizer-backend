import { Category } from '@prisma/client';
import { CategoryDTO } from './category.dto';
import { KeyValueDTO } from './key-value.dto';

export interface ExpenseDTO {
  id: string;
  amount: number;
  concept: string;
  categoryId: string;
  category: CategoryDTO;
  status: 'PENDING' | 'PAID';
}

export interface CreateExpenseDTO extends Pick<ExpenseDTO, 'id' | 'amount' | 'concept'> {
  category: CategoryDTO;
  status: KeyValueDTO;
}
