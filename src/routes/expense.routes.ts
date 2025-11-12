import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';

const router = Router();
const expenseController = new ExpenseController();

// Rutas de gastos
router.post('/expenses', (req, res) => expenseController.create(req, res));
router.get('/expenses/budget/:budgetId', (req, res) => expenseController.getByBudget(req, res));
router.put('/expenses/:id', (req, res) => expenseController.update(req, res));
router.delete('/expenses/:id', (req, res) => expenseController.delete(req, res));

export default router;