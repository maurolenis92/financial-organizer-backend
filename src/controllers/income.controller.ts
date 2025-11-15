import { NextFunction, Request, Response } from 'express';
import { IncomeService } from '../services/income.service';
import { BadRequestError, NotFoundError } from '../errors/app-error';

const incomeService = new IncomeService();

export class IncomeController {
  
  // POST /api/incomes
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { amount, concept, budgetId } = req.body;
      
      // Validar datos requeridos
      if (amount == null || !concept || !budgetId) {
        throw new BadRequestError('Faltan datos requeridos');
      }
      
      const income = await incomeService.createIncome({ amount, concept, budgetId });
      
      res.status(201).json(income);
  }
  
  // GET /api/incomes/budget/:budgetId
  async getByBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { budgetId } = req.params;
      
      const incomes = await incomeService.getIncomesByBudget(budgetId);
      
      res.json(incomes);
  }

  // PUT /api/incomes/:id
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      const { amount, concept } = req.body;
      
      const updatedIncome = await incomeService.updateIncome(id, { amount, concept });
      
      if (!updatedIncome) {
        throw new NotFoundError('Ingreso no encontrado');
      }
      
      res.json(updatedIncome);
  }

  // DELETE /api/incomes/:id
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      
      const deletedIncome = await incomeService.deleteIncome(id);
      
      if (!deletedIncome) {
        throw new NotFoundError('Ingreso no encontrado');
      }
      
      res.json(deletedIncome);
  }

}