import { Budget, Category, Expense, Income } from '@prisma/client';
import { BudgetListItemDTO, BudgetResponseDTO } from '../dtos/budget.dto';
import { ExpenseDTO } from '../dtos/expense.dto';

export class BudgetMapper {
  // Convierte Budget de BD a BudgetListItemDTO
  static toListItemDTO(budget: Budget): BudgetListItemDTO {
    // Calcular porcentaje usado
    const percentageUsed =
      budget.totalIncomes > 0 ? (budget.totalExpenses / budget.totalIncomes) * 100 : 0;

    // Calcular días restantes
    const today = new Date();
    const endDate = new Date(budget.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: budget.id,
      name: budget.name,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      currency: budget.currency,
      totalIncomes: budget.totalIncomes,
      totalExpenses: budget.totalExpenses,
      availableMoney: budget.availableMoney,
      percentageUsed: Math.round(percentageUsed * 100) / 100, // 2 decimales
      daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
    };
  }

  static toDetailDTO(
    budget: Budget & {
      incomes: Income[];
      expenses: Expense[];
    }
  ): BudgetResponseDTO {
    return {
      id: budget.id,
      name: budget.name,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      currency: budget.currency,
      totalPaidExpenses: budget.expenses
        .filter((e) => e.status === 'PAID')
        .reduce((sum, e) => sum + e.amount, 0),
      totalIncomes: budget.totalIncomes,
      totalExpenses: budget.totalExpenses,
      availableMoney: budget.availableMoney,
      percentageUsed:
        budget.totalIncomes > 0
          ? Math.round((budget.totalExpenses / budget.totalIncomes) * 10000) / 100
          : 0,
      daysRemaining: (() => {
        const today = new Date();
        const endDate = new Date(budget.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days < 0 ? 0 : days;
      })(),
      incomesCount: budget.incomes.length,
      expensesCount: budget.expenses.length,
      expenses: budget.expenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        concept: expense.concept,
        categoryId: expense.categoryId,
        category: (expense as any).category,
        status: expense.status,
      })),
      incomes: budget.incomes.map((income) => ({
        id: income.id,
        amount: income.amount,
        concept: income.concept,
      })),
    };
  }
}
