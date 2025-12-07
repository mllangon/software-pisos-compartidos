import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ErrorMessages } from '../../common/error-messages';
import { IsString, MinLength, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

class CreateExpenseDto {
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(1, { message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  groupId!: string;

  @IsNumber({}, { message: ErrorMessages.EXPENSE_AMOUNT_REQUIRED })
  @Min(0.01, { message: ErrorMessages.EXPENSE_AMOUNT_INVALID })
  amount!: number;

  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(1, { message: ErrorMessages.EXPENSE_DESCRIPTION_REQUIRED })
  description!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  payerId?: string;

  @IsDateString({}, { message: ErrorMessages.VALIDATION_DATE_INVALID })
  date!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Req() req: any, @Body() body: CreateExpenseDto) {
    try {
      return await this.expenses.createExpense(body.groupId, body.payerId || req.user.sub, {
        amount: body.amount,
        description: body.description,
        category: body.category,
        date: new Date(body.date),
      });
    } catch (error: any) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  @Get('group/:groupId')
  async list(@Req() req: any, @Param('groupId') groupId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.expenses.listGroupExpenses(
      groupId,
      req.user.sub,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.expenses.deleteExpense(id, req.user.sub);
  }
}

