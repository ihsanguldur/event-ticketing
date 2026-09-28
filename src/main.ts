import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from './config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { port } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  await app.listen(port);
}
await bootstrap();
