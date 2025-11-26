import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('debería estar definido', () => {
    expect(strategy).toBeDefined();
  });

  it('validate debe devolver el usuario con sub y email', async () => {
    const payload = { sub: 1, email: 'test@mail.com' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      sub: 1,
      email: 'test@mail.com',
    });
  });

  it('validate debe fallar si el payload no es válido', async () => {
    const badPayload = {};

    await expect(strategy.validate(badPayload as any)).rejects.toThrow();
  });
});
