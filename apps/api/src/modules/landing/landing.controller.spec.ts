import { Test, TestingModule } from '@nestjs/testing';
import { LandingController } from './landing.controller';

describe('LandingController', () => {
  let controller: LandingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
    }).compile();

    controller = module.get<LandingController>(LandingController);
  });

  it('root devuelve HTML', () => {
    const result = controller.root();
    expect(typeof result).toBe('string');
    expect(result).toContain('<!doctype html>');
    expect(result).toContain('API · Pisos compartidos');
  });
});
