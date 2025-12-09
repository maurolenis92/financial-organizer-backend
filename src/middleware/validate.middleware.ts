import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Usar safeParse en lugar de parse (más seguro)
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Formatear errores de Zod
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    // Si es válido, continuar
    next();
  };
};
