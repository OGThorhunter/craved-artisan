import pino from 'pino';

const dev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: dev ? { target: 'pino-pretty', options: { colorize: true } } : undefined
});
