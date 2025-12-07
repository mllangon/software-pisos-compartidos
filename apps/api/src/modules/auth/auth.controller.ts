import { Body, Controller, Get, Post, Put, Req, UseGuards, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt.guard';
import { ErrorMessages } from '../../common/error-messages';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

class LoginDto {
  @IsEmail({}, { message: ErrorMessages.VALIDATION_EMAIL_INVALID })
  email!: string;
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(6, { message: ErrorMessages.VALIDATION_PASSWORD_TOO_SHORT })
  password!: string;
}

class RegisterDto {
  @IsEmail({}, { message: ErrorMessages.VALIDATION_EMAIL_INVALID })
  email!: string;
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(2, { message: ErrorMessages.VALIDATION_NAME_TOO_SHORT })
  name!: string;
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(6, { message: ErrorMessages.VALIDATION_PASSWORD_TOO_SHORT })
  password!: string;
}

class UpdateProfileDto {
  @IsString({ message: ErrorMessages.VALIDATION_FIELD_REQUIRED })
  @MinLength(2, { message: ErrorMessages.PROFILE_NAME_TOO_SHORT })
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  avatarUrl?: string;
  @IsString()
  @IsOptional()
  bio?: string;
  @IsString()
  @IsOptional()
  phone?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() body: RegisterDto) {
    const { email, password, name } = body;
    return this.authService.register(email, password, name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) throw new NotFoundException(ErrorMessages.PROFILE_USER_NOT_FOUND);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, body);
  }
}



