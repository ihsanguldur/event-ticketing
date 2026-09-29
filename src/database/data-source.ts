import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source-options.js';
import { databaseConfig } from '../config/database.config.js';

if (existsSync('.env')) {
  process.loadEnvFile();
}

export default new DataSource(dataSourceOptions(databaseConfig()));
