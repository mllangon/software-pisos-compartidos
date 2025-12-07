import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ErrorMessages } from '../../common/error-messages';
import { IsEmail, IsString, MinLength } from 'class-validator';

class CreateGroupDto {
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(2, { message: ErrorMessages.GROUP_NAME_TOO_SHORT })
  name!: string;
}

class SendInvitationDto {
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  groupId!: string;
  @IsEmail({}, { message: ErrorMessages.VALIDATION_EMAIL_INVALID })
  inviteeEmail!: string;
}

class UpdateRulesDto {
  @IsString()
  rules!: string;
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

  @Get(':id/rules')
  async getRules(@Req() req: any, @Param('id') id: string) {
    return this.groups.getGroupRules(id, req.user.sub);
  }

  @Put(':id/rules')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateRules(@Req() req: any, @Param('id') id: string, @Body() body: UpdateRulesDto) {
    return this.groups.updateGroupRules(id, req.user.sub, body.rules);
  }
}


