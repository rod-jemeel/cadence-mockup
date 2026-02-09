import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;

  app.enableCors({
    origin: configService.get<string>('corsOrigin') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`NestJS API running on http://localhost:${port}`);
}

bootstrap();
