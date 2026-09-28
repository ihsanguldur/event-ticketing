import { registerAs } from '@nestjs/config';
import { parseEnv } from './env.js';

export const redisConfig = registerAs('redis', () => {
  const env = parseEnv(process.env);
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  };
});
