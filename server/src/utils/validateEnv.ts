import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production']),
  SESSION_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env); 