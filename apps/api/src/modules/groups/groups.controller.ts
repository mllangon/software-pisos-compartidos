import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';

class CreateGroupDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

class SendInvitationDto {
  @IsString()
  groupId!: string;
  @IsEmail()
  inviteeEmail!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Req() req: any, @Body() body: CreateGroupDto) {
    return this.groups.createGroup(req.user.sub, body.name);
  }

  @Get('mine')
  async mine(@Req() req: any) {
    return this.groups.listMyGroups(req.user.sub);
  }

  @Get('invitations')
  async listInvitations(@Req() req: any) {
    return this.groups.listInvitations(req.user.email);
  }

  @Post('invitations')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async sendInvitation(@Req() req: any, @Body() body: SendInvitationDto) {
    return this.groups.sendInvitation(req.user.sub, body.groupId, body.inviteeEmail);
  }

  @Post('invitations/:id/accept')
  async accept(@Req() req: any, @Param('id') id: string) {
    return this.groups.acceptInvitation(id, req.user.sub, req.user.email);
  }

  @Get(':id/members')
  async listMembers(@Req() req: any, @Param('id') id: string) {
    return this.groups.listGroupMembers(id, req.user.sub);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.groups.deleteGroup(id, req.user.sub);
  }
}


