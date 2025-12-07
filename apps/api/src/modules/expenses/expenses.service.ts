import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../users/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(
    groupId: string,
    payerId: string,
    data: { amount: number; description: string; category?: string; date: Date },
  ) {
    try {
      // Verificar que el usuario es miembro del grupo
      const group = await (this.prisma as any).group.findUnique({
        where: { id: groupId },
        include: { members: true },
      });
      if (!group) throw new NotFoundException('Group not found');
      const isMember = group.members.some((m: any) => m.userId === payerId);
      if (!isMember) throw new UnauthorizedException('Not a member of this group');

      return await (this.prisma as any).expense.create({
        data: {
          groupId,
          payerId,
          amount: data.amount,
          description: data.description,
          category: data.category || null,
          date: data.date,
        },
        include: { payer: true },
      });
    } catch (error: any) {
      console.error('Error in createExpense:', error);
      throw error;
    }
  }

  async listGroupExpenses(groupId: string, userId: string, startDate?: Date, endDate?: Date) {
    // Verificar que el usuario es miembro del grupo
    const group = await (this.prisma as any).group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) throw new NotFoundException('Group not found');
    const isMember = group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this group');

    const where: any = { groupId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return (this.prisma as any).expense.findMany({
      where,
      include: { payer: true },
      orderBy: { date: 'desc' },
    });
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await (this.prisma as any).expense.findUnique({
      where: { id: expenseId },
      include: { group: { include: { members: true } } },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    const isMember = expense.group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this group');
    // Solo el que pagó o el owner del grupo puede eliminar
    const isOwner = expense.group.ownerId === userId;
    const isPayer = expense.payerId === userId;
    if (!isOwner && !isPayer) throw new UnauthorizedException('Only payer or group owner can delete');

    await (this.prisma as any).expense.delete({ where: { id: expenseId } });
    return { ok: true };
  }
}





