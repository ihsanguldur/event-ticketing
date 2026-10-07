import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from './config/app.config.js';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { port, nodeEnv } = app.get<ConfigType<typeof appConfig>>(
    appConfig.KEY,
  );

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('event-ticketing')
      .setVersion('0.1')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();
    SwaggerModule.setup('docs', app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  await app.listen(port);
}
await bootstrap();
