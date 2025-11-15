import { z } from 'zod';

// Schema para crear presupuesto
export const createBudgetSchema = z.object({
  startDate: z.iso.date({
    message: 'startDate debe ser una fecha válida en formato ISO'
  }),
  endDate: z.iso.date({
    message: 'endDate debe ser una fecha válida en formato ISO'
  }),
  currency: z.enum(['COP', 'USD', 'EUR', 'MXN', 'ARS'], {
    message: 'currency debe ser una de las siguientes opciones: COP, USD, EUR, MXN, ARS'
  })
});

// Schema para actualizar presupuesto
export const updateBudgetSchema = z.object({
  currency: z.enum(['COP', 'USD', 'EUR', 'MXN', 'ARS']).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debes proporcionar al menos un campo para actualizar' }
);

// Inferir tipos TypeScript automáticamente
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;