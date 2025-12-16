import { PrismaClient, Budget, Prisma, Category } from '@prisma/client';
import { UpdateBudgetFullDTO } from '../dtos/budget.dto';
import { IncomeDTO } from '../dtos/income.dto';
import { CreateExpenseDTO, ExpenseDTO } from '../dtos/expense.dto';
import { CategoryDTO } from '../dtos/category.dto';

const prisma = new PrismaClient();

// Tipo para Budget con relaciones incluidas
type BudgetWithRelations = Prisma.BudgetGetPayload<{
  include: {
    incomes: true;
    expenses: {
      include: {
        category: true;
      };
    };
  };
}>;

export class BudgetService {
  // Crear presupuesto
  async createBudget(data: {
    userId: string;
    startDate: Date;
    endDate: Date;
    currency: string;
    name: string;
    incomes?: IncomeDTO[];
    expenses?: CreateExpenseDTO[];
    categories?: CategoryDTO[];
  }): Promise<Budget> {
    const budget = await prisma.$transaction(async (tx) => {
      // 0. Crear el presupuesto
      const budget = await tx.budget.create({
        data: {
          userId: data.userId,
          startDate: data.startDate,
          endDate: data.endDate,
          currency: data.currency,
          name: data.name,
          totalIncomes: 0,
          totalExpenses: 0,
          availableMoney: 0,
        },
      });

      // 2. Sincronizar ingresos
      if (data.incomes && data.incomes.length > 0) {
        await this.syncValues(tx.income, budget.id, data.incomes, false, data.userId);
      }

      // 3. Sincronizar gastos
      if (data.expenses && data.expenses.length > 0) {
        await this.syncValues(tx.expense, budget.id, data.expenses, true, data.userId);
      }

      // 4. Recalcular totales
      const totalIncomes = data.incomes
        ? data.incomes.reduce((sum, i) => sum + Number(i.amount), 0)
        : 0;
      const totalExpenses = data.expenses
        ? data.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
        : 0;
      const availableMoney = totalIncomes - totalExpenses;

      await tx.budget.update({
        where: { id: budget.id },
        data: {
          totalIncomes,
          totalExpenses,
          availableMoney,
        },
      });

      return budget;
    });

    return budget;
  }

  // Listar presupuestos de un usuario
  async getBudgetsByUser(userId: string): Promise<BudgetWithRelations[]> {
    return await prisma.budget.findMany({
      where: { userId },
      include: {
        incomes: true,
        expenses: {
          include: { category: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // Obtener un presupuesto específico
  async getBudgetById(id: string, userId: string): Promise<BudgetWithRelations | null> {
    return await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        incomes: true,
        expenses: {
          include: { category: true },
        },
      },
    });
  }

  // Actualizar presupuesto
  async updateBudget(
    id: string,
    data: {
      startDate?: Date;
      endDate?: Date;
      currency?: string;
    }
  ): Promise<Budget> {
    return await prisma.budget.update({
      where: {
        id,
      },
      data,
    });
  }

  // Actualización completa del budget con incomes y expenses
  async updateBudgetFull(
    budgetId: string,
    userId: string,
    data: UpdateBudgetFullDTO
  ): Promise<Budget> {
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar que el budget pertenece al usuario
      const budget = await tx.budget.findFirst({
        where: { id: budgetId, userId },
      });

      if (!budget) {
        throw new Error('Budget not found');
      }

      let budgetUpdate: Prisma.BudgetUpdateInput = {};

      // 2. Actualizar budget si hay cambios
      if (data.startDate || data.endDate || data.currency) {
        budgetUpdate = {
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          currency: data.currency,
        };
      }

      // 3. Sincronizar incomes
      await this.syncValues(tx.income, budgetId, data.incomes, false, userId);

      // 4. Sincronizar expenses
      await this.syncValues(tx.expense, budgetId, data.expenses, true, userId);

      // 5. Recalcular totales
      budgetUpdate.totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      budgetUpdate.totalIncomes = data.incomes.reduce((sum, i) => sum + Number(i.amount), 0);
      budgetUpdate.availableMoney = budgetUpdate.totalIncomes - budgetUpdate.totalExpenses;

      return await tx.budget.update({
        where: { id: budgetId },
        data: budgetUpdate,
      });
    });
  }

  // Sincronizar incomes (create, update, delete)
  private async syncValues(
    model: any,
    budgetId: string,
    values: IncomeDTO[] | CreateExpenseDTO[],
    isExpense: boolean,
    userId: string
  ) {
    // Obtener IDs actuales en la BD
    const existingValues = await model.findMany({
      where: { budgetId },
      select: { id: true },
    });
    const existingIds = existingValues.map((i: any) => i.id);

    if (isExpense) {
      for (const val of values as CreateExpenseDTO[]) {
        const category = await this.syncCategory(prisma.category, userId, val.category);
        val.category.id = category.id;
      }
    }

    // Separar por operación
    const toUpdate = values.filter((i) => i.id);
    const toCreate = values.filter((i) => !i.id);
    const incomingIds = toUpdate.map((i) => i.id!);
    const toDelete = existingIds.filter((id: string) => !incomingIds.includes(id));

    // DELETE - Los que existían pero no vinieron
    if (toDelete.length) {
      await model.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    // UPDATE - Los que tienen id
    for (const income of toUpdate) {
      await model.update({
        where: { id: income.id },
        data: {
          concept: income.concept,
          amount: Number(income.amount),
          ...(isExpense && {
            categoryId: (income as CreateExpenseDTO).category.id,
            status:
              typeof (income as CreateExpenseDTO).status === 'string'
                ? (income as CreateExpenseDTO).status
                : (income as CreateExpenseDTO).status.value,
          }),
        },
      });
    }

    // CREATE - Los que no tienen id
    if (toCreate.length) {
      await model.createMany({
        data: toCreate.map((i) => ({
          budgetId,
          concept: i.concept,
          amount: Number(i.amount),
          ...(isExpense && {
            categoryId: (i as CreateExpenseDTO).category.id,
            status: (i as CreateExpenseDTO).status.value || 'PENDING',
          }),
        })),
      });
    }
  }

  async syncCategory(model: any, userId: string, category: CategoryDTO): Promise<Category> {
    const nameExists = await model.findFirst({
      where: {
        name: category.name,
        userId,
      },
    });
    if (nameExists) {
      return nameExists;
    }
    if (category.id) {
      // UPDATE
      return await model.update({
        where: { id: category.id },
        data: {
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
      });
    } else {
      // CREATE
      return await model.create({
        data: {
          userId,
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
      });
    }
  }

  async syncCategories(model: any, userId: string, categories: CategoryDTO[]) {
    // Obtener categorías existentes
    const existingCategories = await model.findMany({
      where: { userId },
      select: { id: true },
    });
    // Separar por operación
    const toCreate = categories.filter((c) => !c.id);
    // const toDelete = existingIds.filter(id => !incomingIds.includes(id));

    // // DELETE
    // if (toDelete.length) {
    //   await model.deleteMany({
    //     where: { id: { in: toDelete } }
    //   });
    // }

    // UPDATE
    for (const category of existingCategories) {
      await model.update({
        where: { id: category.id },
        data: {
          name: category.name,
          color: category.color,
          icon: category.icon,
        },
      });
    }

    // CREATE
    if (toCreate.length) {
      await model.createMany({
        data: toCreate.map((c) => ({
          userId,
          name: c.name,
          color: c.color,
          icon: c.icon,
        })),
      });
    }
  }

  // Eliminar presupuesto
  async deleteBudget(id: string): Promise<Budget> {
    return await prisma.budget.delete({
      where: {
        id,
      },
    });
  }

  // Recalcular totales del presupuesto
  async recalculateBudget(budgetId: string): Promise<Budget> {
    // Obtener todos los ingresos
    const incomes = await prisma.income.findMany({
      where: { budgetId },
    });

    // Obtener todos los gastos
    const expenses = await prisma.expense.findMany({
      where: { budgetId },
    });

    // Calcular totales
    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const availableMoney = totalIncomes - totalExpenses;

    // Actualizar presupuesto
    return await prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalIncomes,
        totalExpenses,
        availableMoney,
      },
    });
  }
}
