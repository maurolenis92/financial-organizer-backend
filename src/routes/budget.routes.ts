import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { validate } from '../middleware/validate.middleware';
import { createBudgetSchema, updateBudgetFullSchema, updateBudgetSchema } from '../schemas/budget.schema';

const router = Router();
const budgetController = new BudgetController();

// Rutas de presupuestos
router.post('/budgets', validate(createBudgetSchema), (req, res, next) => budgetController.create(req, res, next));
router.get('/budgets', (req, res, next) => budgetController.getAll(req, res, next));
router.get('/budgets/:id', (req, res, next) => budgetController.getById(req, res, next));
router.put('/budgets/:id', validate(updateBudgetFullSchema), (req, res) => budgetController.updateFull(req, res)); 
router.delete('/budgets/:id', (req, res, next) => budgetController.delete(req, res, next));

export default router;