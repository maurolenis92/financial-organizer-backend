import { Budget } from '@prisma/client';
import { BudgetResponseDTO } from '../dtos/budget.dto';

export class BudgetMapper {
  
  // Convierte Budget de BD a BudgetResponseDTO
  static toResponseDTO(
    budget: Budget & { incomes?: any[], expenses?: any[] }
  ): BudgetResponseDTO {
    
    // Calcular porcentaje usado
    const percentageUsed = budget.totalIncomes > 0 
      ? (budget.totalExpenses / budget.totalIncomes) * 100 
      : 0;
    
    // Calcular días restantes
    const today = new Date();
    const endDate = new Date(budget.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      id: budget.id,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate.toISOString(),
      currency: budget.currency,
      totalIncomes: budget.totalIncomes,
      totalExpenses: budget.totalExpenses,
      availableMoney: budget.availableMoney,
      percentageUsed: Math.round(percentageUsed * 100) / 100,  // 2 decimales
      totalPaidExpenses: budget.expenses?.reduce((sum, exp) => 
        exp.status === 'PAID' ? sum + exp.amount : sum, 0) || 0,
      daysRemaining,
      incomesCount: budget.incomes?.length || 0,
      expensesCount: budget.expenses?.length || 0
    };
  }
}