import { Request, Response } from 'express';
import { BudgetService } from '../services/budget.service';

const budgetService = new BudgetService();

export class BudgetController {
  
  // POST /api/budgets
  async create(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Error al crear presupuesto' });
    }
  }
  
  // GET /api/budgets
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const budgets = await budgetService.getBudgetsByUser(userId);
      res.json(budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      res.status(500).json({ error: 'Error al obtener presupuestos' });
    }
  }
  
  // GET /api/budgets/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      const budget = await budgetService.getBudgetById(id, userId);
      
      if (!budget) {
        res.status(404).json({ error: 'Presupuesto no encontrado' });
        return;
      }
      
      res.json(budget);
    } catch (error) {
      console.error('Error fetching budget:', error);
      res.status(500).json({ error: 'Error al obtener presupuesto' });
    }
  }
  
  // PUT /api/budgets/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
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
      
      const budget = await budgetService.updateBudget(id, userId, data);
      res.json(budget);
    } catch (error) {
      console.error('Error updating budget:', error);
      res.status(500).json({ error: 'Error al actualizar presupuesto' });
    }
  }
  
  // DELETE /api/budgets/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = 'b9cdb4e7-4f04-4cde-9501-82a33f3a6461';
      
      await budgetService.deleteBudget(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting budget:', error);
      res.status(500).json({ error: 'Error al eliminar presupuesto' });
    }
  }
}