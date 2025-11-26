import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ access_token: 'mocked_token' }),
    register: jest.fn().mockResolvedValue({
      access_token: 'mocked_token',
      user: { id: 1, email: 'john@mail.com', name: 'John' },
    }),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { sub: 1, email: 'user@test.com' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('debe hacer login correctamente', async () => {
    const body = { email: 'test@mail.com', password: 'abcdef' };

    const result = await controller.login(body);

    expect(result).toEqual({ access_token: 'mocked_token' });
    expect(authService.login).toHaveBeenCalledWith(
      'test@mail.com',
      'abcdef',
    );
  });

  it('debe registrar un usuario correctamente', async () => {
    const body = {
      email: 'john@mail.com',
      password: '123456',
      name: 'John',
    };

    const result = await controller.register(body);

    expect(result).toHaveProperty('access_token');
    expect(result.user).toEqual({
      id: 1,
      email: 'john@mail.com',
      name: 'John',
    });

    expect(authService.register).toHaveBeenCalledWith(
      'john@mail.com',
      '123456',
      'John',
    );
  });

  it('debe devolver el perfil del usuario autenticado', () => {
    const mockRequest: any = {
      user: { sub: 1, email: 'user@test.com' },
    };

    const result = controller.getProfile(mockRequest);

    expect(result).toEqual({
      userId: 1,
      email: 'user@test.com',
    });
  });
});
