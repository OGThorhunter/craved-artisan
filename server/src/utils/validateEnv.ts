import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production']),
  SESSION_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env); 