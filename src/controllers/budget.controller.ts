import { NextFunction, Request, Response } from 'express';
import { BudgetService } from '../services/budget.service';
import { NotFoundError } from '../errors/app-error';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BudgetMapper } from '../mappers/budget.mapper';
import { UpdateBudgetFullDTO } from '../dtos/budget.dto';

const budgetService = new BudgetService();

export class BudgetController {
  // POST /api/budgets
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { startDate, endDate, currency, name, incomes, expenses, categories } = req.body;

    const userId = req.user!.id;

    const budget = await budgetService.createBudget({
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      currency: currency || 'COP',
      name,
      incomes,
      expenses,
      categories,
    });

    res.status(201).json(budget);
  }

  // GET /api/budgets
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user!.id;

    const budgets = await budgetService.getBudgetsByUser(userId);
    const responseDTO = budgets.map((budget) => BudgetMapper.toListItemDTO(budget));
    res.json(responseDTO);
  }

  // GET /api/budgets/:id
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    const budget = await budgetService.getBudgetById(id, userId);
    const responseDTO = budget ? BudgetMapper.toDetailDTO(budget) : null;
    if (!budget) {
      throw new NotFoundError('Presupuesto no encontrado');
    }

    res.json(responseDTO);
  }

  // PUT /api/budgets/:id
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { startDate, endDate, currency } = req.body;

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

  async updateFull(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: UpdateBudgetFullDTO = req.body;

      const budget = await budgetService.updateBudgetFull(id, userId, data);

      // Aquí podrías usar un mapper para la respuesta
      res.json(budget);
    } catch (error) {
      console.error('Error updating budget:', error);

      if (error instanceof Error && error.message === 'Budget not found') {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }

      res.status(500).json({ error: 'Error al actualizar presupuesto' });
    }
  }

  // DELETE /api/budgets/:id
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.id;

    await budgetService.deleteBudget(id);
    res.status(204).send();
  }
}
