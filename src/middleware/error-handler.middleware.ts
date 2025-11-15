import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  
  // 1. Si es un AppError (nuestro error personalizado)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
    return;
  }
  
  // 2. Si es un ZodError (error de validación)
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }
  
  // 3. Errores de Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }
  
  // 4. Error desconocido (500)
  console.error('Unexpected error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

// Helper para errores de Prisma
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  res: Response
): void {
  
  switch (error.code) {
    // Registro no encontrado
    case 'P2025':
      res.status(404).json({
        status: 'error',
        message: 'Record not found'
      });
      break;
    
    // Violación de constraint único
    case 'P2002':
      const target = (error.meta?.target as string[]) || [];
      res.status(409).json({
        status: 'error',
        message: `${target.join(', ')} already exists`
      });
      break;
    
    // Foreign key constraint
    case 'P2003':
      res.status(400).json({
        status: 'error',
        message: 'Invalid reference'
      });
      break;
    
    // Otros errores de Prisma
    default:
      res.status(400).json({
        status: 'error',
        message: 'Database error'
      });
  }
}