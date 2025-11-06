import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { id: user.id, email: user.email, name: user.name };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token, user };
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
    const hash = await bcrypt.hash(password, 10);
    const created = await this.usersService.createUser({ email, password: hash, name });
    const payload = { sub: created.id, email: created.email };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token, user: { id: created.id, email: created.email, name: created.name } };
  }
}



