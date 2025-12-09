import { PrismaClient, Income } from '@prisma/client';

const prisma = new PrismaClient();

export class IncomeService {
  async createIncome(data: { amount: number; concept: string; budgetId: string }): Promise<Income> {
    return await prisma.income.create({
      data: {
        amount: data.amount,
        concept: data.concept,
        budgetId: data.budgetId,
      },
    });
  }

  async getIncomesByBudget(budgetId: string): Promise<Income[]> {
    return await prisma.income.findMany({
      where: { budgetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateIncome(
    id: string,
    data: {
      amount?: number;
      concept?: string;
    }
  ): Promise<Income | null> {
    const existingIncome = await prisma.income.findUnique({
      where: { id },
    });

    if (!existingIncome) {
      return null;
    }

    return await prisma.income.update({
      where: { id },
      data: {
        amount: data.amount ?? existingIncome.amount,
        concept: data.concept ?? existingIncome.concept,
      },
    });
  }

  async deleteIncome(id: string): Promise<Income | null> {
    const existingIncome = await prisma.income.findUnique({
      where: { id },
    });

    if (!existingIncome) {
      return null;
    }

    return await prisma.income.delete({
      where: { id },
    });
  }
}
