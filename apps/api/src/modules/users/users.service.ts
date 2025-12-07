import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async createUser(params: { email: string; password: string; name: string }): Promise<User> {
    const { email, password, name } = params;
    return this.prisma.user.create({
      data: { email: email.toLowerCase(), password, name },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
    });
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string; bio?: string; phone?: string }): Promise<Omit<User, 'password'>> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}



