import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../users/prisma.service';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGroup(ownerId: string, name: string) {
    const group = await (this.prisma as any).group.create({
      data: {
        name,
        ownerId,
        members: { create: { userId: ownerId, role: 'owner' } },
      },
    });
    return group;
  }

  async listMyGroups(userId: string) {
    return (this.prisma as any).group.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listInvitations(userEmail: string) {
    return (this.prisma as any).invitation.findMany({
      where: { inviteeEmail: userEmail.toLowerCase(), status: 'PENDING' },
      include: { group: true, inviter: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendInvitation(inviterId: string, groupId: string, inviteeEmail: string) {
    const group = await (this.prisma as any).group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException(ErrorMessages.GROUP_NOT_FOUND);
    if (group.ownerId !== inviterId) throw new UnauthorizedException(ErrorMessages.GROUP_ONLY_OWNER_CAN_INVITE);
    return (this.prisma as any).invitation.create({
      data: {
        groupId,
        inviterId,
        inviteeEmail: inviteeEmail.toLowerCase(),
      },
    });
  }

  async acceptInvitation(invitationId: string, userId: string, userEmail: string) {
    const inv = await (this.prisma as any).invitation.findUnique({ where: { id: invitationId } });
    if (!inv || inv.status !== 'PENDING') throw new NotFoundException(ErrorMessages.INVITATION_NOT_FOUND);
    if (inv.inviteeEmail.toLowerCase() !== userEmail.toLowerCase()) throw new UnauthorizedException(ErrorMessages.INVITATION_NOT_YOURS);
    await (this.prisma as any).$transaction([
      (this.prisma as any).invitation.update({ where: { id: inv.id }, data: { status: 'ACCEPTED' } }),
      (this.prisma as any).groupMember.upsert({
        where: { groupId_userId: { groupId: inv.groupId, userId } },
        update: {},
        create: { groupId: inv.groupId, userId, role: 'member' },
      }),
    ]);
    return { ok: true };
  }

  async listGroupMembers(groupId: string, userId: string) {
    const group = await (this.prisma as any).group.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: true } } },
    });
    if (!group) throw new NotFoundException(ErrorMessages.GROUP_NOT_FOUND);
    const isMember = group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException(ErrorMessages.GROUP_NOT_MEMBER);
    return group.members.map((m: any) => ({
      id: m.id,
      role: m.role,
      user: { id: m.user.id, email: m.user.email, name: m.user.name },
    }));
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await (this.prisma as any).group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException(ErrorMessages.GROUP_NOT_FOUND);
    if (group.ownerId !== userId) throw new UnauthorizedException(ErrorMessages.GROUP_ONLY_OWNER_CAN_DELETE);
    await (this.prisma as any).$transaction([
      // Delete invitations first
      (this.prisma as any).invitation.deleteMany({ where: { groupId } }),
      // Delete group members
      (this.prisma as any).groupMember.deleteMany({ where: { groupId } }),
      // Finally delete the group
      (this.prisma as any).group.delete({ where: { id: groupId } }),
    ]);
    return { ok: true };
  }

  async getGroupRules(groupId: string, userId: string) {
    const group = await (this.prisma as any).group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) throw new NotFoundException(ErrorMessages.GROUP_NOT_FOUND);
    const isMember = group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException(ErrorMessages.GROUP_NOT_MEMBER);
    return { rules: group.rules || '' };
  }

  async updateGroupRules(groupId: string, userId: string, rules: string) {
    const group = await (this.prisma as any).group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException(ErrorMessages.GROUP_NOT_FOUND);
    if (group.ownerId !== userId) throw new UnauthorizedException(ErrorMessages.GROUP_ONLY_OWNER_CAN_UPDATE_RULES);
    const updated = await (this.prisma as any).group.update({
      where: { id: groupId },
      data: { rules },
    });
    return { rules: updated.rules || '' };
  }
}


