import { IncomeController } from "../controllers/income.controller";
import { Router } from "express";
import { validate } from '../middleware/validate.middleware';
import { createIncomeSchema, updateIncomeSchema } from "../schemas/income.schema";

const router = Router();
const incomeController = new IncomeController();

// Rutas de ingresos
router.post('/incomes', validate(createIncomeSchema), (req, res, next) => incomeController.create(req, res, next));
router.get('/incomes/budget/:budgetId', (req, res, next) => incomeController.getByBudget(req, res, next));
router.put('/incomes/:id', validate(updateIncomeSchema), (req, res, next) => incomeController.update(req, res, next));
router.delete('/incomes/:id', (req, res, next) => incomeController.delete(req, res, next));

export default router;