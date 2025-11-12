import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';

const router = Router();
const budgetController = new BudgetController();

// Rutas de presupuestos
router.post('/budgets', (req, res) => budgetController.create(req, res));
router.get('/budgets', (req, res) => budgetController.getAll(req, res));
router.get('/budgets/:id', (req, res) => budgetController.getById(req, res));
router.put('/budgets/:id', (req, res) => budgetController.update(req, res));
router.delete('/budgets/:id', (req, res) => budgetController.delete(req, res));

export default router;