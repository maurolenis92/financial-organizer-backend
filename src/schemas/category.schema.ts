import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color debe ser un hex válido')
    .optional(),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
    icon: z.string().max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes proporcionar al menos un campo',
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
