import { Request, Response } from 'express';
import { ExpenseService } from '../services/expense.service';


const expenseService = new ExpenseService();
export class ExpenseController {

  // POST /api/expenses
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId, categoryId, concept, amount, status } = req.body;

      // Validar datos requeridos
      if (!budgetId || !categoryId || !concept || amount == null || !status) {
        res.status(400).json({ error: 'Faltan datos requeridos' });
        return;
      }

      const expense = await expenseService.createExpense({ budgetId, categoryId, concept, amount, status });

      res.status(201).json(expense);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Error al crear gasto' });
    }
  }

  // GET /api/expenses/budget/:budgetId
  async getByBudget(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;

      const expenses = await expenseService.getAllExpenses({ budgetId });

      res.json(expenses);
    } catch (error) {
      console.error('Error fetching expenses by budget:', error);
      res.status(500).json({ error: 'Error al obtener gastos por presupuesto' });
    }
  }

  // PUT /api/expenses/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { categoryId, concept, amount, status } = req.body;

      const updatedExpense = await expenseService.updateExpense(id, { categoryId, concept, amount, status });

      if (!updatedExpense) {
        res.status(404).json({ error: 'Gasto no encontrado' });
        return;
      }

      res.json(updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Error al actualizar gasto' });
    }
  }

  // DELETE /api/expenses/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deletedExpense = await expenseService.deleteExpense(id);

      if (!deletedExpense) {
        res.status(404).json({ error: 'Gasto no encontrado' });
        return;
      }

      res.json(deletedExpense);
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Error al eliminar gasto' });
    }
  }
}