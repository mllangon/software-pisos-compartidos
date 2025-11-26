import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('validateUser debe validar correctamente credenciales', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@mail.com',
      password: 'hashedpass',
      name: 'Test',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@mail.com', '123456');

    expect(result).toEqual({ id: 1, email: 'test@mail.com', name: 'Test' });
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@mail.com');
  });

  it('validateUser debe lanzar Unauthorized si el usuario no existe', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(service.validateUser('a@a.com', '123')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('validateUser debe lanzar Unauthorized si la contraseña es incorrecta', async () => {
    mockUsersService.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@mail.com',
      password: 'hash',
      name: 'Test',
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.validateUser('test@mail.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('login debe devolver token y usuario', async () => {
    const user = {
      id: 1,
      email: 'test@mail.com',
      name: 'Test',
      password: 'ignored',   // ← NECESARIO para evitar error de TS
    };

    jest.spyOn(service, 'validateUser').mockResolvedValue(user);

    const result = await service.login('test@mail.com', 'pass');

    expect(result).toEqual({
      access_token: 'mocked_jwt_token',
      user,
    });

    expect(service.validateUser).toHaveBeenCalledWith(
      'test@mail.com',
      'pass',
    );
    expect(jwtService.signAsync).toHaveBeenCalled();
  });

  it('register debe crear usuario y devolver token', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');

    mockUsersService.createUser.mockResolvedValue({
      id: 10,
      email: 'new@mail.com',
      name: 'New User',
    });

    const result = await service.register(
      'new@mail.com',
      '123456',
      'New User',
    );

    expect(result).toEqual({
      access_token: 'mocked_jwt_token',
      user: {
        id: 10,
        email: 'new@mail.com',
        name: 'New User',
      },
    });

    expect(mockUsersService.findByEmail).toHaveBeenCalledWith('new@mail.com');
    expect(mockUsersService.createUser).toHaveBeenCalled();
  });

  it('register debe lanzar ConflictException si el email ya existe', async () => {
    mockUsersService.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      service.register('test@mail.com', '123456', 'Test'),
    ).rejects.toThrow(ConflictException);
  });
});
