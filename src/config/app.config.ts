import { registerAs } from '@nestjs/config';
import { parseEnv } from './env.js';

export const appConfig = registerAs('app', () => {
  const env = parseEnv(process.env);
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  };
});
