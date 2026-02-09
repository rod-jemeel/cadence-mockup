import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(port ?? 3001);
  console.log(`NestJS API running on http://localhost:${port}`);
}

bootstrap();
