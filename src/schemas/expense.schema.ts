import { z } from 'zod';

export const createExpenseSchema = z.object({
  budgetId: z.uuid({
    message: 'budgetId debe ser un UUID válido'
  }),
  categoryId: z.uuid({
    message: 'categoryId debe ser un UUID válido'
  }),
  concept: z.string().min(1, 'Concepto es requerido').max(255),
  amount: z.number().positive({
    message: 'El monto debe ser mayor a 0'
  }),
  status: z.enum(['PENDING', 'PAID']).optional().default('PENDING'),
});

export const updateExpenseSchema = z.object({
  categoryId: z.uuid({
    message: 'categoryId debe ser un UUID válido'
  }),
  concept: z.string().min(1, 'Concepto es requerido').max(255),
  amount: z.number().positive({
    message: 'El monto debe ser mayor a 0'
  }),
  status: z.enum(['PENDING', 'PAID'])
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;