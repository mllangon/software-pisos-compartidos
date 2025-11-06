import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../users/prisma.service';

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
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== inviterId) throw new UnauthorizedException('Only owner can invite');
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
    if (!inv || inv.status !== 'PENDING') throw new NotFoundException('Invitation not found');
    if (inv.inviteeEmail.toLowerCase() !== userEmail.toLowerCase()) throw new UnauthorizedException('Not your invitation');
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
    if (!group) throw new NotFoundException('Group not found');
    const isMember = group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this group');
    return group.members.map((m: any) => ({
      id: m.id,
      role: m.role,
      user: { id: m.user.id, email: m.user.email, name: m.user.name },
    }));
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await (this.prisma as any).group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== userId) throw new UnauthorizedException('Only owner can delete group');
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
}


