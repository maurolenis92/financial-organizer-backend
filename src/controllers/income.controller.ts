import { Request, Response } from 'express';
import { IncomeService } from '../services/income.service';

const incomeService = new IncomeService();

export class IncomeController {
  
  // POST /api/incomes
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { amount, concept, budgetId } = req.body;
      
      // Validar datos requeridos
      if (amount == null || !concept || !budgetId) {
        res.status(400).json({ error: 'Faltan datos requeridos' });
        return;
      }
      
      const income = await incomeService.createIncome({ amount, concept, budgetId });
      
      res.status(201).json(income);
    } catch (error) {
      console.error('Error creating income:', error);
      res.status(500).json({ error: 'Error al crear ingreso' });
    }
  }
  
  // GET /api/incomes/budget/:budgetId
  async getByBudget(req: Request, res: Response): Promise<void> {
    try {
      const { budgetId } = req.params;
      
      const incomes = await incomeService.getIncomesByBudget(budgetId);
      
      res.json(incomes);
    } catch (error) {
      console.error('Error fetching incomes by budget:', error);
      res.status(500).json({ error: 'Error al obtener ingresos por presupuesto' });
    }
  }

  // PUT /api/incomes/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, concept } = req.body;
      
      const updatedIncome = await incomeService.updateIncome(id, { amount, concept });
      
      if (!updatedIncome) {
        res.status(404).json({ error: 'Ingreso no encontrado' });
        return;
      }
      
      res.json(updatedIncome);
    } catch (error) {
      console.error('Error updating income:', error);
      res.status(500).json({ error: 'Error al actualizar ingreso' });
    }
  }

  // DELETE /api/incomes/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deletedIncome = await incomeService.deleteIncome(id);
      
      if (!deletedIncome) {
        res.status(404).json({ error: ' Ingreso no encontrado' });
        return;
      }
      
      res.json(deletedIncome);
    } catch (error) {
      console.error('Error deleting income:', error);
      res.status(500).json({ error: 'Error al eliminar ingreso' });
    }
  }

}