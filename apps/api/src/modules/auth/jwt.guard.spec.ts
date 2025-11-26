import { JwtAuthGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  it('debería estar definido', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it('debería extender AuthGuard con la estrategia jwt', () => {
    const guard = new JwtAuthGuard();

    const parent = Object.getPrototypeOf(guard);
    expect(parent).toBeInstanceOf(AuthGuard('jwt').constructor);
  });
});
