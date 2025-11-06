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
}



