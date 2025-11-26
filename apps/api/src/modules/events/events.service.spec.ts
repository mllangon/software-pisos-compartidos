import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../users/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    group: {
      findUnique: jest.fn(),
    },
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('crea un evento si el usuario es miembro del grupo', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        id: 'G1',
        members: [{ userId: 'U1' }],
      });

      mockPrisma.event.create.mockResolvedValue({ id: 'E1' });

      const result = await service.createEvent('G1', 'U1', {
        title: 'Test',
        type: 'EVENT',
        date: new Date('2025-01-01'),
      });

      expect(result).toEqual({ id: 'E1' });
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(
        service.createEvent('G1', 'U1', {
          title: 'A',
          type: 'EVENT',
          date: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'OTHER' }],
      });

      await expect(
        service.createEvent('G1', 'U1', {
          title: 'A',
          type: 'EVENT',
          date: new Date(),
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('listGroupEvents', () => {
    it('lista eventos si el usuario pertenece al grupo', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'U1' }],
      });

      mockPrisma.event.findMany.mockResolvedValue([{ id: 'E1' }]);

      const result = await service.listGroupEvents('G1', 'U1');

      expect(result).toEqual([{ id: 'E1' }]);
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(service.listGroupEvents('G1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'X' }],
      });

      await expect(service.listGroupEvents('G1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateEvent', () => {
    it('actualiza el evento si el usuario es miembro', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'E1',
        group: { members: [{ userId: 'U1' }] },
      });

      mockPrisma.event.update.mockResolvedValue({ id: 'E1', title: 'Updated' });

      const result = await service.updateEvent('E1', 'U1', { title: 'Updated' });

      expect(result).toEqual({ id: 'E1', title: 'Updated' });
    });

    it('lanza error si el evento no existe', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.updateEvent('E1', 'U1', {})).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        group: { members: [{ userId: 'OTHER' }] },
      });

      await expect(service.updateEvent('E1', 'U1', {})).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteEvent', () => {
    it('elimina el evento si el usuario es owner o creator', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        id: 'E1',
        group: { members: [{ userId: 'U1' }], ownerId: 'U1' },
        creatorId: 'U2',
      });

      mockPrisma.event.delete.mockResolvedValue(null);

      const result = await service.deleteEvent('E1', 'U1');

      expect(result).toEqual({ ok: true });
    });

    it('lanza error si el evento no existe', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.deleteEvent('E1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        group: { members: [{ userId: 'OTHER' }] },
      });

      await expect(service.deleteEvent('E1', 'U1')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza error si el usuario no es owner ni creator', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({
        group: { members: [{ userId: 'U1' }], ownerId: 'OWNER' },
        creatorId: 'CREATOR',
      });

      await expect(service.deleteEvent('E1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
