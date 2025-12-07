import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : (exception as Error).message || 'Internal server error';

    console.error(`[${request.method}] ${request.url} - Error:`, message);
    if (exception instanceof Error) {
      console.error('Stack:', exception.stack);
    }

    const errorMessage = typeof message === 'string' 
      ? message 
      : (message as any).message || 'Error interno del servidor. Por favor, intenta nuevamente más tarde.';
    
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      error: exception instanceof HttpException ? (message as any).error : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [/http:\/\/localhost:3000$/],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();



