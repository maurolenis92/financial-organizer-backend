import { Budget } from '@prisma/client';
import { ActiveBudgetDTO } from '../dtos/dashboard.dto';

export class DashboardMapper {
  // Convertir Budget de BD a ActiveBudgetDTO
  static toActiveBudgetDTO(budget: Budget, now: Date = new Date()): ActiveBudgetDTO {
    // Calcular días restantes
    const daysRemaining =
      budget.endDate > now
        ? Math.ceil((budget.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Determinar status
    let status: 'ACTIVO' | 'PLANIFICADO' | 'COMPLETADO' = 'ACTIVO';
    if (budget.endDate < now) {
      status = 'COMPLETADO';
    } else if (budget.startDate > now) {
      status = 'PLANIFICADO';
    }

    // Calcular porcentaje usado
    const percentageUsed =
      budget.totalIncomes > 0 ? Math.round((budget.totalExpenses / budget.totalIncomes) * 100) : 0;

    return {
      id: budget.id,
      name: budget.name,
      status,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalIncome: budget.totalIncomes,
      totalExpenses: budget.totalExpenses,
      percentageUsed,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
  }

  // Calcular porcentaje de cambio
  static calculatePercentageChange(previous: number, current: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Calcular tiempo transcurrido
  static getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString();
  }
}
