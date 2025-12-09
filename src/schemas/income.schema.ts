import { z } from 'zod';

export const createIncomeSchema = z.object({
  budgetId: z.uuid({
    message: 'budgetId debe ser un UUID válido',
  }),
  concept: z.string().min(1, 'Concepto es requerido').max(255),
  amount: z.number().positive('El monto debe ser mayor a 0'),
});

export const updateIncomeSchema = z
  .object({
    concept: z.string().min(1).max(255).optional(),
    amount: z.number().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes proporcionar al menos un campo',
  });

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
