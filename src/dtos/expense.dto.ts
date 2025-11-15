

export interface ExpenseDTO {
  id: string;
  amount: number;
  concept: string;
  categoryId: string;
  status: 'PENDING' | 'PAID';
}
