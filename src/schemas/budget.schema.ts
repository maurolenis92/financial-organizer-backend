import { z } from 'zod';

// Schema para crear presupuesto
export const createBudgetSchema = z.object({
  startDate: z.iso.datetime({
    message: 'startDate debe ser una fecha válida en formato ISO',
  }),
  endDate: z.iso.datetime({
    message: 'endDate debe ser una fecha válida en formato ISO',
  }),
  name: z.string().min(1, 'Nombre es requerido'),
  currency: z.enum(['COP', 'USD', 'EUR', 'MXN', 'ARS'], {
    message: 'currency debe ser una de las siguientes opciones: COP, USD, EUR, MXN, ARS',
  }),
});

// Schema para actualizar presupuesto
export const updateBudgetSchema = z
  .object({
    name: z.string().min(1, 'Nombre es requerido').optional(),
    currency: z.enum(['COP', 'USD', 'EUR', 'MXN', 'ARS']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes proporcionar al menos un campo para actualizar',
  });

// Schema para item de income
const incomeItemSchema = z.object({
  id: z.uuid().optional(),
  concept: z.string().min(1, 'Concepto es requerido'),
  amount: z.number().positive('Monto debe ser positivo'),
});

// Schema para item de expense
const expenseItemSchema = z.object({
  id: z.uuid().optional(),
  concept: z.string().min(1, 'Concepto es requerido'),
  amount: z.number().positive('Monto debe ser positivo'),
  categoryId: z.uuid('CategoryId inválido'),
  status: z.enum(['PENDING', 'PAID']).optional(),
});

// Schema para actualización completa
export const updateBudgetFullSchema = z.object({
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  currency: z.string().min(1).optional(),
  incomes: z.array(incomeItemSchema),
  expenses: z.array(expenseItemSchema),
});

// Inferir tipos TypeScript automáticamente
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type UpdateBudgetFullInput = z.infer<typeof updateBudgetFullSchema>;
