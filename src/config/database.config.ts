import { registerAs } from '@nestjs/config';
import { parseEnv } from './env.js';

export const databaseConfig = registerAs('database', () => {
  const env = parseEnv(process.env);
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
  };
});
