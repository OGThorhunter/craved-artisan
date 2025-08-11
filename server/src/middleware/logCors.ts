import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';

// Create logger for CORS logging
const corsLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'cors-logger' },
  transports: [
    new transports.File({ filename: 'logs/cors.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// CORS allowlist for different environments
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000'
  ];

  // Add production origins if available
  if (process.env.CLIENT_URL) {
    baseOrigins.push(process.env.CLIENT_URL);
  }

  // Add additional origins from environment
  if (process.env.ADDITIONAL_CORS_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(',').map(origin => origin.trim());
    baseOrigins.push(...additionalOrigins);
  }

  return baseOrigins.filter(Boolean);
};

export const logCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = getAllowedOrigins();
  
  // Log the request origin and whether it's allowed
  const isAllowed = !origin || allowedOrigins.includes(origin);
  
  corsLogger.info('CORS Request', {
    origin: origin || 'no-origin',
    method: req.method,
    path: req.path,
    allowed: isAllowed,
    allowedOrigins: allowedOrigins,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  // Set Vary: Origin header for proper caching behavior
  res.setHeader('Vary', 'Origin');

  // If it's a preflight request, log additional details
  if (req.method === 'OPTIONS') {
    corsLogger.info('CORS Preflight Request', {
      origin: origin || 'no-origin',
      accessControlRequestMethod: req.get('Access-Control-Request-Method'),
      accessControlRequestHeaders: req.get('Access-Control-Request-Headers'),
      allowed: isAllowed
    });
  }

  next();
};

// Enhanced CORS configuration with logging
export const corsWithLogging = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      corsLogger.info('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      corsLogger.info(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      corsLogger.warn(`CORS: Blocking origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

