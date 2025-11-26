import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../users/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: PrismaService;

  const mockPrisma = {
    group: {
      findUnique: jest.fn(),
    },
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createExpense', () => {
    it('crea un gasto cuando el usuario es miembro del grupo', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        id: 'G1',
        members: [{ userId: 'U1' }],
      });

      mockPrisma.expense.create.mockResolvedValue({ id: 'EXP_1' });

      const result = await service.createExpense('G1', 'U1', {
        amount: 10,
        description: 'Café',
        category: 'Food',
        date: new Date('2025-01-01'),
      });

      expect(result).toEqual({ id: 'EXP_1' });
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(
        service.createExpense('G1', 'U1', {
          amount: 10,
          description: 'Café',
          date: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'OTHER' }],
      });

      await expect(
        service.createExpense('G1', 'U1', {
          amount: 10,
          description: 'Café',
          date: new Date(),
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('listGroupExpenses', () => {
    it('lista gastos cuando el usuario pertenece al grupo', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'U1' }],
      });

      mockPrisma.expense.findMany.mockResolvedValue([{ id: 'EXP_1' }]);

      const result = await service.listGroupExpenses('G1', 'U1');

      expect(result).toEqual([{ id: 'EXP_1' }]);
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(service.listGroupExpenses('G1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'X' }],
      });

      await expect(service.listGroupExpenses('G1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteExpense', () => {
    it('elimina un gasto cuando el usuario es owner o payer', async () => {
      mockPrisma.expense.findUnique.mockResolvedValue({
        id: 'EXP_1',
        group: { members: [{ userId: 'U1' }], ownerId: 'U1' },
        payerId: 'U2',
      });

      mockPrisma.expense.delete.mockResolvedValue(null);

      const result = await service.deleteExpense('EXP_1', 'U1');

      expect(result).toEqual({ ok: true });
    });

    it('lanza error si no existe el gasto', async () => {
      mockPrisma.expense.findUnique.mockResolvedValue(null);

      await expect(service.deleteExpense('EXP_1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.expense.findUnique.mockResolvedValue({
        group: { members: [{ userId: 'OTHER' }] },
      });

      await expect(service.deleteExpense('EXP_1', 'U1')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza error si no es owner ni payer', async () => {
      mockPrisma.expense.findUnique.mockResolvedValue({
        group: { members: [{ userId: 'U1' }], ownerId: 'OWNER' },
        payerId: 'PAYER',
      });

      await expect(service.deleteExpense('EXP_1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
