import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('getHealth devuelve status ok', () => {
    const result = controller.getHealth();
    expect(result).toEqual({ status: 'ok' });
  });

  it('getHealthUi devuelve HTML', () => {
    const result = controller.getHealthUi();
    expect(typeof result).toBe('string');
    expect(result).toContain('<!doctype html>');
    expect(result).toContain('status: ok');
  });
});
