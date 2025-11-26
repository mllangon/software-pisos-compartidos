import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: GroupsService;

  const mockGroupsService = {
    createGroup: jest.fn(),
    listMyGroups: jest.fn(),
    listInvitations: jest.fn(),
    sendInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    listGroupMembers: jest.fn(),
    deleteGroup: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: jest.fn((ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { sub: 'USER_1', email: 'user@mail.com' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        { provide: GroupsService, useValue: mockGroupsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crea un grupo', async () => {
      mockGroupsService.createGroup.mockResolvedValue({ id: 'G1' });

      const req = { user: { sub: 'USER_1' } };
      const body = { name: 'Mi Grupo' };

      const result = await controller.create(req, body);

      expect(mockGroupsService.createGroup).toHaveBeenCalledWith('USER_1', 'Mi Grupo');
      expect(result).toEqual({ id: 'G1' });
    });
  });

  describe('mine', () => {
    it('lista mis grupos', async () => {
      mockGroupsService.listMyGroups.mockResolvedValue([{ id: 'G1' }]);

      const req = { user: { sub: 'USER_1' } };

      const result = await controller.mine(req);

      expect(mockGroupsService.listMyGroups).toHaveBeenCalledWith('USER_1');
      expect(result).toEqual([{ id: 'G1' }]);
    });
  });

  describe('listInvitations', () => {
    it('lista invitaciones', async () => {
      mockGroupsService.listInvitations.mockResolvedValue([{ id: 'INV_1' }]);

      const req = { user: { email: 'user@mail.com' } };

      const result = await controller.listInvitations(req);

      expect(mockGroupsService.listInvitations).toHaveBeenCalledWith('user@mail.com');
      expect(result).toEqual([{ id: 'INV_1' }]);
    });
  });

  describe('sendInvitation', () => {
    it('envía una invitación', async () => {
      mockGroupsService.sendInvitation.mockResolvedValue({ ok: true });

      const req = { user: { sub: 'USER_1' } };
      const body = { groupId: 'G1', inviteeEmail: 'invite@mail.com' };

      const result = await controller.sendInvitation(req, body);

      expect(mockGroupsService.sendInvitation).toHaveBeenCalledWith('USER_1', 'G1', 'invite@mail.com');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('accept', () => {
    it('acepta una invitación', async () => {
      mockGroupsService.acceptInvitation.mockResolvedValue({ ok: true });

      const req = { user: { sub: 'USER_1', email: 'user@mail.com' } };

      const result = await controller.accept(req, 'INV_1');

      expect(mockGroupsService.acceptInvitation).toHaveBeenCalledWith('INV_1', 'USER_1', 'user@mail.com');
      expect(result).toEqual({ ok: true });
    });
  });

  describe('listMembers', () => {
    it('lista miembros del grupo', async () => {
      mockGroupsService.listGroupMembers.mockResolvedValue([{ id: 'U1' }]);

      const req = { user: { sub: 'USER_1' } };

      const result = await controller.listMembers(req, 'G1');

      expect(mockGroupsService.listGroupMembers).toHaveBeenCalledWith('G1', 'USER_1');
      expect(result).toEqual([{ id: 'U1' }]);
    });
  });

  describe('delete', () => {
    it('elimina un grupo', async () => {
      mockGroupsService.deleteGroup.mockResolvedValue({ ok: true });

      const req = { user: { sub: 'USER_1' } };

      const result = await controller.delete(req, 'G1');

      expect(mockGroupsService.deleteGroup).toHaveBeenCalledWith('G1', 'USER_1');
      expect(result).toEqual({ ok: true });
    });
  });
});
