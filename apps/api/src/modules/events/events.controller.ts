import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, MinLength, IsOptional, IsBoolean, IsDateString, IsIn } from 'class-validator';

class CreateEventDto {
  @IsString()
  @MinLength(1)
  groupId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['TASK', 'EVENT', 'REMINDER'])
  type!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}

class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['TASK', 'EVENT', 'REMINDER'])
  type?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Req() req: any, @Body() body: CreateEventDto) {
    try {
      return await this.events.createEvent(body.groupId, req.user.sub, {
        title: body.title,
        description: body.description,
        type: body.type,
        date: new Date(body.date),
        assignedTo: body.assignedTo && body.assignedTo.trim() !== '' ? body.assignedTo : undefined,
      });
    } catch (error: any) {
      // Log del error para debugging
      console.error('Error creating event:', error);
      throw error;
    }
  }

  @Get('group/:groupId')
  async list(@Req() req: any, @Param('groupId') groupId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.events.listGroupEvents(
      groupId,
      req.user.sub,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateEventDto) {
    return this.events.updateEvent(id, req.user.sub, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.events.deleteEvent(id, req.user.sub);
  }
}

