import winston from 'winston';

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
  level,
  format: isDev 
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    : winston.format.json(),
  transports: [new winston.transports.Console()],
});
