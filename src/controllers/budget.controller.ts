import { NextFunction, Request, Response } from 'express';
import { BudgetService } from '../services/budget.service';
import { NotFoundError } from '../errors/app-error';

const budgetService = new BudgetService();

export class BudgetController {
  
  // POST /api/budgets
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { startDate, endDate, currency } = req.body;
      
      // TODO: Obtener userId del token de autenticación
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const budget = await budgetService.createBudget({
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currency: currency || 'COP'
      });
      
      res.status(201).json(budget);
  }
  
  // GET /api/budgets
  async getAllbyUser( req: Request, res: Response, next: NextFunction): Promise<void> {
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const budgets = await budgetService.getBudgetsByUser(userId);
      res.json(budgets);
  }
  
  // GET /api/budgets/:id
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const budget = await budgetService.getBudgetById(id, userId);
      
      if (!budget) {
        throw new NotFoundError('Presupuesto no encontrado');
      }
      
      res.json(budget);
  }
  
  // PUT /api/budgets/:id
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      const { startDate, endDate, currency } = req.body;
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const data: {
        startDate?: Date;
        endDate?: Date;
        currency?: string;
      } = {};
      
      if (startDate) data.startDate = new Date(startDate);
      if (endDate) data.endDate = new Date(endDate);
      if (currency) data.currency = currency;
      
      const budget = await budgetService.updateBudget(id, data);
      res.json(budget);
  }
  
  // DELETE /api/budgets/:id
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      await budgetService.deleteBudget(id);
      res.status(204).send();
  }
}