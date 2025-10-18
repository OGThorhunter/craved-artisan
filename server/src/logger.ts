import pino from 'pino';

const dev = process.env.NODE_ENV !== 'production';

// Pino log levels: trace (10), debug (20), info (30), warn (40), error (50), fatal (60)
// Note: Pino uses 'fatal' not 'critical'
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: dev ? { target: 'pino-pretty', options: { colorize: true } } : undefined
});
