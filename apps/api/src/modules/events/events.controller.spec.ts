import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ExecutionContext } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    createEvent: jest.fn(),
    listGroupEvents: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: jest.fn((ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      req.user = { sub: 'USER_ID_123', email: 'test@mail.com' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);

    jest.clearAllMocks();
  });

  it('create debe llamar a createEvent con parámetros correctos', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    const body = {
      groupId: 'GROUP_1',
      title: 'Evento test',
      description: 'Descripción',
      type: 'EVENT',
      date: '2025-01-01T00:00:00.000Z',
      assignedTo: 'USER_2',
    };

    mockEventsService.createEvent.mockResolvedValue({ ok: true });

    const result = await controller.create(req, body);

    expect(mockEventsService.createEvent).toHaveBeenCalledWith(
      'GROUP_1',
      'USER_ID_123',
      {
        title: 'Evento test',
        description: 'Descripción',
        type: 'EVENT',
        date: new Date('2025-01-01T00:00:00.000Z'),
        assignedTo: 'USER_2',
      },
    );

    expect(result).toEqual({ ok: true });
  });

  it('list debe llamar listGroupEvents con fechas convertidas correctamente', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    const start = '2025-01-01';
    const end = '2025-01-20';

    mockEventsService.listGroupEvents.mockResolvedValue([]);

    const result = await controller.list(req, 'GROUP_1', start, end);

    expect(mockEventsService.listGroupEvents).toHaveBeenCalledWith(
      'GROUP_1',
      'USER_ID_123',
      new Date(start),
      new Date(end),
    );

    expect(result).toEqual([]);
  });

  it('list debe aceptar undefined si no envían fechas', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    await controller.list(req, 'GROUP_1');

    expect(mockEventsService.listGroupEvents).toHaveBeenCalledWith(
      'GROUP_1',
      'USER_ID_123',
      undefined,
      undefined,
    );
  });

  it('update debe convertir date a objeto Date si existe', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    const dto = {
      title: 'Nuevo título',
      date: '2025-05-05T00:00:00.000Z',
    };

    mockEventsService.updateEvent.mockResolvedValue({ updated: true });

    const result = await controller.update(req, 'EVENT_ID_1', dto);

    expect(mockEventsService.updateEvent).toHaveBeenCalledWith(
      'EVENT_ID_1',
      'USER_ID_123',
      {
        ...dto,
        date: new Date('2025-05-05T00:00:00.000Z'),
      },
    );

    expect(result).toEqual({ updated: true });
  });

  it('update debe dejar date como undefined si no la envían', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    const dto = { title: 'Nuevo título' };

    await controller.update(req, 'EVENT_ID_1', dto);

    expect(mockEventsService.updateEvent).toHaveBeenCalledWith(
      'EVENT_ID_1',
      'USER_ID_123',
      {
        title: 'Nuevo título',
        date: undefined,
      },
    );
  });

  it('delete debe llamar deleteEvent correctamente', async () => {
    const req = { user: { sub: 'USER_ID_123' } };

    mockEventsService.deleteEvent.mockResolvedValue({ deleted: true });

    const result = await controller.delete(req, 'EVENT_ID_7');

    expect(mockEventsService.deleteEvent).toHaveBeenCalledWith(
      'EVENT_ID_7',
      'USER_ID_123',
    );

    expect(result).toEqual({ deleted: true });
  });
});
