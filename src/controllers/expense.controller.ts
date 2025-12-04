import { NextFunction, Request, Response } from 'express';
import { ExpenseService } from '../services/expense.service';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { AuthenticatedRequest } from '../middleware/auth.middleware';


const expenseService = new ExpenseService();
export class ExpenseController {

  // POST /api/expenses
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      const { budgetId, categoryId, concept, amount, status } = req.body;

      // Validar datos requeridos
      if (!budgetId || !categoryId || !concept || amount == null || !status) {
        throw new BadRequestError('Faltan datos requeridos para crear el gasto');
      }

      const expense = await expenseService.createExpense({ budgetId, categoryId, concept, amount, status });

      res.status(201).json(expense);
  }

  // GET /api/expenses/budget/:budgetId
  async getByBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      const { budgetId } = req.params;

      const expenses = await expenseService.getAllExpenses({ budgetId });

      res.json(expenses);
  }

  // PUT /api/expenses/:id
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;
      const { categoryId, concept, amount, status } = req.body;

      const updatedExpense = await expenseService.updateExpense(id, { categoryId, concept, amount, status });

      if (!updatedExpense) {
        throw new NotFoundError('Gasto no encontrado');
      }

      res.json(updatedExpense);
  }

  // DELETE /api/expenses/:id
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      const { id } = req.params;

      const deletedExpense = await expenseService.deleteExpense(id);

      if (!deletedExpense) {
        throw new NotFoundError('Gasto no encontrado');
      }

      res.json(deletedExpense);
  }
}