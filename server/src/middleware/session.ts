import session from 'express-session';
import { createClient } from 'redis';
import { logger } from '../logger';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

// For now, use memory store until Redis is properly configured
// TODO: Implement Redis store when Redis is available

// Session configuration
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-here-minimum-16-chars',
  name: 'craved.sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  resave: false,
  saveUninitialized: false,
  rolling: true
});

// Middleware to attach user to request
export const attachUser = (req: any, res: any, next: any) => {
  if (req.session.userId) {
    req.user = {
      userId: req.session.userId,
      email: req.session.email,
      role: req.session.role,
      isAuthenticated: true,
      lastActivity: new Date()
    };
  }
  next();
};

// Middleware to require authentication
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user?.isAuthenticated) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

// Middleware to require specific role
export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user?.isAuthenticated) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};
