import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { parseEnv } from './config/env.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { redisConfig } from './config/redis.config.js';
import { mailConfig } from './config/mail.config.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source-options.js';
import { VenuesModule } from './venues/venues.module.js';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveRequestId } from './common/request-id.js';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { TimingInterceptor } from './common/interceptors/timing.interceptor.js';
import { AuthModule } from './auth/auth.module.js';
import { authConfig } from './config/auth.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: parseEnv,
      load: [appConfig, databaseConfig, redisConfig, mailConfig, authConfig],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: IncomingMessage) => resolveRequestId(req),
        setup: (cls, _req, res: ServerResponse) => {
          res.setHeader('X-Request-Id', cls.getId());
        },
      },
    }),
    LoggerModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (app: ConfigType<typeof appConfig>) => ({
        pinoHttp: {
          level: app.nodeEnv === 'production' ? 'info' : 'debug',
          genReqId: (req) => resolveRequestId(req),
          redact: ['req.headers.authorization', 'req.headers.cookie'],
          transport:
            app.nodeEnv === 'development'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) =>
        dataSourceOptions(db),
    }),
    VenuesModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
