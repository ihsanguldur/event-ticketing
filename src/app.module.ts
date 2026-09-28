import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { parseEnv } from './config/env.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { redisConfig } from './config/redis.config.js';
import { mailConfig } from './config/mail.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: parseEnv,
      load: [appConfig, databaseConfig, redisConfig, mailConfig],
    }),
  ],
})
export class AppModule {}
