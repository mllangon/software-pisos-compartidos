import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaService } from '../users/prisma.service';

@Module({
  providers: [ExpensesService, PrismaService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}


