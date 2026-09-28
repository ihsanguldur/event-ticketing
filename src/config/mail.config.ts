import { registerAs } from '@nestjs/config';
import { parseEnv } from './env.js';

export const mailConfig = registerAs('mail', () => {
  const env = parseEnv(process.env);
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
  };
});
