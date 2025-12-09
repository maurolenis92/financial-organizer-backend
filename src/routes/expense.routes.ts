import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { validate } from '../middleware/validate.middleware';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expense.schema';

const router = Router();
const expenseController = new ExpenseController();

// Rutas de gastos
router.post('/expenses', validate(createExpenseSchema), (req, res, next) =>
  expenseController.create(req, res, next)
);
router.get('/expenses/budget/:budgetId', (req, res, next) =>
  expenseController.getByBudget(req, res, next)
);
router.put('/expenses/:id', validate(updateExpenseSchema), (req, res, next) =>
  expenseController.update(req, res, next)
);
router.delete('/expenses/:id', (req, res, next) => expenseController.delete(req, res, next));

export default router;
