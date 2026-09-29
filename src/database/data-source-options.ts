import { join } from 'node:path';
import type { ConfigType } from '@nestjs/config';
import type { databaseConfig } from '../config/database.config.js';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy.js';

export function dataSourceOptions(
  db: ConfigType<typeof databaseConfig>,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.name,
    entities: [join(import.meta.dirname, '..', '**', '*.entity.js')],
    migrations: [join(import.meta.dirname, 'migrations', '*.js')],
    synchronize: false,
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    namingStrategy: new SnakeNamingStrategy(),
  };
}
