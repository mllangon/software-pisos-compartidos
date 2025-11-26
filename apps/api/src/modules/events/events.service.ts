import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../users/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(
    groupId: string,
    creatorId: string,
    data: { title: string; description?: string; type: string; date: Date; assignedTo?: string },
  ) {
    try {
      // Verificar que el usuario es miembro del grupo
      const group = await (this.prisma as any).group.findUnique({
        where: { id: groupId },
        include: { members: true },
      });
      if (!group) throw new NotFoundException('Group not found');
      const isMember = group.members.some((m: any) => m.userId === creatorId);
      if (!isMember) throw new UnauthorizedException('Not a member of this group');

      const eventData: any = {
        groupId,
        creatorId,
        title: data.title,
        description: data.description || null,
        type: data.type,
        date: data.date,
      };

      // Solo añadir assignedTo si tiene valor válido
      if (data.assignedTo && data.assignedTo.trim() !== '') {
        eventData.assignedTo = data.assignedTo;
      }

      return await (this.prisma as any).event.create({
        data: eventData,
        include: { creator: true, assignee: true },
      });
    } catch (error: any) {
      console.error('Error in createEvent:', error);
      // Si es un error de Prisma sobre tabla no encontrada
      if (error.message && error.message.includes('does not exist')) {
        throw new Error('La tabla Event no existe. Ejecuta: pnpm prisma:migrate en apps/api');
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  async listGroupEvents(groupId: string, userId: string, startDate?: Date, endDate?: Date) {
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

    return (this.prisma as any).event.findMany({
      where,
      include: { creator: true, assignee: true },
      orderBy: { date: 'asc' },
    });
  }

  async updateEvent(eventId: string, userId: string, data: Partial<{ title: string; description: string; type: string; date: Date; completed: boolean; assignedTo: string }>) {
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
      include: { group: { include: { members: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    const isMember = event.group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this group');

    return (this.prisma as any).event.update({
      where: { id: eventId },
      data,
      include: { creator: true, assignee: true },
    });
  }

  async deleteEvent(eventId: string, userId: string) {
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
      include: { group: { include: { members: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    const isMember = event.group.members.some((m: any) => m.userId === userId);
    if (!isMember) throw new UnauthorizedException('Not a member of this group');
    // Solo el creador o el owner del grupo puede eliminar
    const isOwner = event.group.ownerId === userId;
    const isCreator = event.creatorId === userId;
    if (!isOwner && !isCreator) throw new UnauthorizedException('Only creator or group owner can delete');

    await (this.prisma as any).event.delete({ where: { id: eventId } });
    return { ok: true };
  }
}

