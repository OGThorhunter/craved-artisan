import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable schemas
const envSchema = z.object({
  // Required environment variables
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL'),
  
  // Optional environment variables
  USE_MOCK: z.string().optional().transform(val => val === 'true'),
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  
  // Stripe configuration (stubs for now)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
  
  // Server configuration
  PORT: z.string().optional().transform(val => val ? parseInt(val, 10) : 3001),
  
  // Database configuration
  DATABASE_POOL_SIZE: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  DATABASE_TIMEOUT: z.string().optional().transform(val => val ? parseInt(val, 10) : 30000),
  
  // Session configuration
  SESSION_COOKIE_SECURE: z.string().optional().transform(val => val === 'true'),
  SESSION_COOKIE_HTTPONLY: z.string().optional().transform(val => val !== 'false'),
  SESSION_COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).optional().default('lax'),
  SESSION_MAX_AGE: z.string().optional().transform(val => val ? parseInt(val, 10) : 24 * 60 * 60 * 1000),
  
  // CORS configuration
  CORS_ORIGIN: z.string().optional().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().optional().transform(val => val !== 'false'),
  
  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  LOG_FILE_ENABLED: z.string().optional().transform(val => val !== 'false'),
  
  // Security configuration
  RATE_LIMIT_WINDOW_MS: z.string().optional().transform(val => val ? parseInt(val, 10) : 15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional().transform(val => val ? parseInt(val, 10) : 100),
  
  // Feature flags
  ENABLE_ANALYTICS: z.string().optional().transform(val => val !== 'false'),
  ENABLE_AI_FEATURES: z.string().optional().transform(val => val !== 'false'),
  ENABLE_STRIPE: z.string().optional().transform(val => val !== 'false'),
  ENABLE_SENTRY: z.string().optional().transform(val => val !== 'false'),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation logic
    if (env.NODE_ENV === 'production') {
      if (!env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is required in production');
      }
      if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is required in production');
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'));
      throw new Error(`Environment validation failed: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}

// Export the validated configuration
export const config = parseEnv();

// Export individual config sections for convenience
export const serverConfig = {
  port: config.PORT,
  nodeEnv: config.NODE_ENV,
  useMock: config.USE_MOCK,
} as const;

export const databaseConfig = {
  url: config.DATABASE_URL,
  poolSize: config.DATABASE_POOL_SIZE,
  timeout: config.DATABASE_TIMEOUT,
} as const;

export const sessionConfig = {
  secret: config.SESSION_SECRET,
  cookie: {
    secure: config.SESSION_COOKIE_SECURE,
    httpOnly: config.SESSION_COOKIE_HTTPONLY,
    sameSite: config.SESSION_COOKIE_SAMESITE,
    maxAge: config.SESSION_MAX_AGE,
  },
} as const;

export const corsConfig = {
  origin: config.CORS_ORIGIN,
  credentials: config.CORS_CREDENTIALS,
} as const;

export const stripeConfig = {
  secretKey: config.STRIPE_SECRET_KEY,
  publishableKey: config.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: config.STRIPE_WEBHOOK_SECRET,
  connectClientId: config.STRIPE_CONNECT_CLIENT_ID,
  enabled: config.ENABLE_STRIPE,
} as const;

export const loggingConfig = {
  level: config.LOG_LEVEL,
  fileEnabled: config.LOG_FILE_ENABLED,
} as const;

export const securityConfig = {
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;

export const featureConfig = {
  analytics: config.ENABLE_ANALYTICS,
  ai: config.ENABLE_AI_FEATURES,
  stripe: config.ENABLE_STRIPE,
  sentry: config.ENABLE_SENTRY,
} as const;

// Type exports
export type Config = typeof config;
export type ServerConfig = typeof serverConfig;
export type DatabaseConfig = typeof databaseConfig;
export type SessionConfig = typeof sessionConfig;
export type CorsConfig = typeof corsConfig;
export type StripeConfig = typeof stripeConfig;
export type LoggingConfig = typeof loggingConfig;
export type SecurityConfig = typeof securityConfig;
export type FeatureConfig = typeof featureConfig;

// Utility function to check if we're in development mode
export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Utility function to check if mock mode is enabled
export const isMockMode = config.USE_MOCK === true;

// Default export for convenience
export default config;
