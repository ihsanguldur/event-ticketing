import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { parseEnv } from './config/env.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { redisConfig } from './config/redis.config.js';
import { mailConfig } from './config/mail.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source-options.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: parseEnv,
      load: [appConfig, databaseConfig, redisConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) =>
        dataSourceOptions(db),
    }),
  ],
})
export class AppModule {}
