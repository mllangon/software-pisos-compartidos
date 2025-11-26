import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { PrismaService } from '../users/prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('GroupsService', () => {
  let service: GroupsService;
  let prisma: PrismaService;

  const mockPrisma = {
    group: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    invitation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    groupMember: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('crea un grupo correctamente', async () => {
      mockPrisma.group.create.mockResolvedValue({ id: 'G1' });

      const result = await service.createGroup('U1', 'Grupo');

      expect(result).toEqual({ id: 'G1' });
      expect(mockPrisma.group.create).toHaveBeenCalled();
    });
  });

  describe('listMyGroups', () => {
    it('lista grupos donde soy miembro', async () => {
      mockPrisma.group.findMany.mockResolvedValue([{ id: 'G1' }]);

      const result = await service.listMyGroups('U1');

      expect(result).toEqual([{ id: 'G1' }]);
      expect(mockPrisma.group.findMany).toHaveBeenCalled();
    });
  });

  describe('listInvitations', () => {
    it('lista invitaciones pendientes', async () => {
      mockPrisma.invitation.findMany.mockResolvedValue([{ id: 'I1' }]);

      const result = await service.listInvitations('mail@mail.com');

      expect(result).toEqual([{ id: 'I1' }]);
      expect(mockPrisma.invitation.findMany).toHaveBeenCalled();
    });
  });

  describe('sendInvitation', () => {
    it('envía invitación si el usuario es owner', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ ownerId: 'U1' });
      mockPrisma.invitation.create.mockResolvedValue({ id: 'I1' });

      const result = await service.sendInvitation('U1', 'G1', 'invite@mail.com');

      expect(result).toEqual({ id: 'I1' });
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(service.sendInvitation('U1', 'G1', 'a@mail.com')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si no es owner', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ ownerId: 'OTHER' });

      await expect(service.sendInvitation('U1', 'G1', 'a@mail.com')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('acceptInvitation', () => {
    it('acepta invitación correctamente', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'I1',
        status: 'PENDING',
        inviteeEmail: 'user@mail.com',
        groupId: 'G1',
      });

      const result = await service.acceptInvitation('I1', 'U1', 'user@mail.com');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('lanza error si la invitación no existe', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvitation('I1', 'U1', 'user@mail.com')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el correo no coincide', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        status: 'PENDING',
        inviteeEmail: 'other@mail.com',
      });

      await expect(service.acceptInvitation('I1', 'U1', 'user@mail.com')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('listGroupMembers', () => {
    it('lista miembros si el usuario pertenece al grupo', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [
          { id: 'M1', role: 'member', user: { id: 'U1', email: 'a@mail.com', name: 'A' }, userId: 'U1' },
        ],
      });

      const result = await service.listGroupMembers('G1', 'U1');

      expect(result).toEqual([
        { id: 'M1', role: 'member', user: { id: 'U1', email: 'a@mail.com', name: 'A' } },
      ]);
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(service.listGroupMembers('G1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si el usuario no es miembro', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({
        members: [{ userId: 'OTHER' }],
      });

      await expect(service.listGroupMembers('G1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteGroup', () => {
    it('elimina el grupo si es owner', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ ownerId: 'U1' });

      const result = await service.deleteGroup('G1', 'U1');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('lanza error si el grupo no existe', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(service.deleteGroup('G1', 'U1')).rejects.toThrow(NotFoundException);
    });

    it('lanza error si no es owner', async () => {
      mockPrisma.group.findUnique.mockResolvedValue({ ownerId: 'OTHER' });

      await expect(service.deleteGroup('G1', 'U1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
