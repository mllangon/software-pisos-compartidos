import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  const mockExpensesService = {
    createExpense: jest.fn(),
    listGroupExpenses: jest.fn(),
    deleteExpense: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: jest.fn((ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { sub: 'USER_1' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        { provide: ExpensesService, useValue: mockExpensesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crea un gasto con datos correctos', async () => {
      const req = { user: { sub: 'USER_1' } };
      const body = {
        groupId: 'GROUP_1',
        amount: 50,
        description: 'Cena',
        category: 'Food',
        date: '2025-01-01T00:00:00.000Z',
      };

      mockExpensesService.createExpense.mockResolvedValue({ id: 'EXP_1' });

      const result = await controller.create(req, body);

      expect(mockExpensesService.createExpense).toHaveBeenCalledWith(
        'GROUP_1',
        'USER_1',
        {
          amount: 50,
          description: 'Cena',
          category: 'Food',
          date: new Date('2025-01-01T00:00:00.000Z'),
        },
      );

      expect(result).toEqual({ id: 'EXP_1' });
    });

    it('usa payerId si viene en el body', async () => {
      const req = { user: { sub: 'USER_1' } };
      const body = {
        groupId: 'GROUP_1',
        amount: 20,
        description: 'Taxi',
        date: '2025-01-01',
        payerId: 'USER_2',
      };

      mockExpensesService.createExpense.mockResolvedValue({ id: 'EXP_2' });

      const result = await controller.create(req, body);

      expect(mockExpensesService.createExpense).toHaveBeenCalledWith(
        'GROUP_1',
        'USER_2',
        {
          amount: 20,
          description: 'Taxi',
          category: undefined,
          date: new Date('2025-01-01'),
        },
      );

      expect(result).toEqual({ id: 'EXP_2' });
    });
  });

  describe('list', () => {
    it('lista gastos con fechas convertidas', async () => {
      const req = { user: { sub: 'USER_1' } };

      mockExpensesService.listGroupExpenses.mockResolvedValue([]);

      const start = '2025-01-01';
      const end = '2025-01-15';

      const result = await controller.list(req, 'GROUP_1', start, end);

      expect(mockExpensesService.listGroupExpenses).toHaveBeenCalledWith(
        'GROUP_1',
        'USER_1',
        new Date(start),
        new Date(end),
      );

      expect(result).toEqual([]);
    });

    it('lista gastos con fechas undefined si no se envían', async () => {
      const req = { user: { sub: 'USER_1' } };

      await controller.list(req, 'GROUP_1');

      expect(mockExpensesService.listGroupExpenses).toHaveBeenCalledWith(
        'GROUP_1',
        'USER_1',
        undefined,
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('elimina un gasto', async () => {
      const req = { user: { sub: 'USER_1' } };

      mockExpensesService.deleteExpense.mockResolvedValue({ ok: true });

      const result = await controller.delete(req, 'EXP_9');

      expect(mockExpensesService.deleteExpense).toHaveBeenCalledWith(
        'EXP_9',
        'USER_1',
      );

      expect(result).toEqual({ ok: true });
    });
  });
});
