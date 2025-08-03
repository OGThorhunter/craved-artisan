import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production']),
  SESSION_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url().optional(),
  // Twilio configuration (optional for development)
  TWILIO_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE: z.string().optional(),
  // Stripe configuration
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env); 