import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from './prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('encuentra usuario por email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'U1', email: 'a@mail.com' });

      const result = await service.findByEmail('A@MAIL.COM');

      expect(result).toEqual({ id: 'U1', email: 'a@mail.com' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@mail.com' },
      });
    });

    it('devuelve null si no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('none@mail.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('crea usuario correctamente', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'U1',
        email: 'test@mail.com',
        name: 'Test',
      });

      const result = await service.createUser({
        email: 'TEST@mail.com',
        password: '123456',
        name: 'Test',
      });

      expect(result).toEqual({
        id: 'U1',
        email: 'test@mail.com',
        name: 'Test',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@mail.com',
          password: '123456',
          name: 'Test',
        },
      });
    });
  });
});
