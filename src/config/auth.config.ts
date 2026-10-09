import { registerAs } from '@nestjs/config';
import { parseEnv } from './env.js';

export const authConfig = registerAs('auth', () => {
  const env = parseEnv(process.env);

  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessTtl: env.JWT_ACCESS_TTL,
    refreshTtl: env.REFRESH_TOKEN_TTL,
  };
});
