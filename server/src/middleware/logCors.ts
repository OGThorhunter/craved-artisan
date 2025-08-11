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

// Environment-specific CORS configuration
const getCorsConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'development':
      return {
        origins: ['http://localhost:5173'],
        credentials: true,
        cookie: {
          sameSite: 'lax',
          secure: false,
          httpOnly: true,
          domain: undefined
        }
      };
      
    case 'staging':
      return {
        origins: ['https://staging.cravedartisan.com'],
        credentials: true,
        cookie: {
          sameSite: 'lax',
          secure: true,
          httpOnly: true,
          domain: '.cravedartisan.com'
        }
      };
      
    case 'production':
      return {
        origins: ['https://cravedartisan.com'],
        credentials: true,
        cookie: {
          sameSite: 'strict',
          secure: true,
          httpOnly: true,
          domain: '.cravedartisan.com'
        }
      };
      
    default:
      return {
        origins: ['http://localhost:5173'],
        credentials: true,
        cookie: {
          sameSite: 'lax',
          secure: false,
          httpOnly: true,
          domain: undefined
        }
      };
  }
};

// Get allowed origins for current environment
const getAllowedOrigins = () => {
  const config = getCorsConfig();
  return config.origins;
};

export const logCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = getAllowedOrigins();
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Log the request origin and whether it's allowed
  const isAllowed = !origin || allowedOrigins.includes(origin);
  
  corsLogger.info('CORS Request', {
    origin: origin || 'no-origin',
    method: req.method,
    path: req.path,
    allowed: isAllowed,
    allowedOrigins: allowedOrigins,
    environment: nodeEnv,
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
      allowed: isAllowed,
      environment: nodeEnv
    });
  }

  next();
};

// Enhanced CORS configuration with environment-specific settings
export const corsWithLogging = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = getAllowedOrigins();
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Allow requests with no origin (like mobile apps or curl requests) in development only
    if (!origin) {
      if (nodeEnv === 'development') {
        corsLogger.info('CORS: Allowing request with no origin (development mode)');
        return callback(null, true);
      } else {
        corsLogger.warn('CORS: Blocking request with no origin (production mode)');
        return callback(new Error('Origin required in production'));
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      corsLogger.info(`CORS: Allowing origin: ${origin} (${nodeEnv})`);
      callback(null, true);
    } else {
      corsLogger.warn(`CORS: Blocking origin: ${origin} (${nodeEnv})`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy in ${nodeEnv}`));
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
    'X-API-Key',
    'X-Request-ID'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Request-ID'],
  maxAge: 86400 // 24 hours
};

// Export CORS configuration for use in session middleware
export const getCorsConfigForSession = () => {
  return getCorsConfig().cookie;
};

