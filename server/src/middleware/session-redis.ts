import session from 'express-session';
import RedisStore from 'connect-redis';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { logger } from '../logger';

// Create Redis store for sessions
const redisClient = getRedisClient();

// Configure session store based on Redis availability
const createSessionStore = () => {
  // If REDIS_URL is configured, always try to use Redis
  // The Redis client will handle connection errors gracefully
  if (process.env.REDIS_URL) {
    logger.info('✅ Configuring Redis session store');
    try {
      const store = new RedisStore({
        client: redisClient as any,
        prefix: 'sess:',
        ttl: 86400, // 24 hours in seconds
      });
      
      // Add error handling for Redis store
      (store as any).on('error', (err: Error) => {
        logger.error({ error: err }, '❌ Redis session store error');
      });
      
      return store;
    } catch (error) {
      logger.error({ error }, '❌ Failed to create Redis session store, falling back to memory store');
      return undefined;
    }
  } else {
    logger.warn('⚠️  No REDIS_URL configured - using memory store (sessions will not persist across restarts)');
    return undefined; // Express-session will use default memory store
  }
};

// Session configuration with Redis
export const sessionMiddleware = session({
  store: createSessionStore(),
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-here-minimum-16-chars',
  name: 'craved.sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  },
  resave: false, // Don't save session if unmodified (Redis handles this)
  saveUninitialized: false, // Don't create session until something is stored
  rolling: true, // Reset maxAge on every request
});

// Middleware to attach user to request
export const attachUser = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    req.user = {
      userId: req.session.userId,
      email: req.session.email,
      role: req.session.role,
      vendorProfileId: req.session.vendorProfileId || req.session.userId, // Use userId as fallback
      isAuthenticated: true,
      lastActivity: new Date()
    };
    
    logger.debug({ 
      userId: req.user.userId, 
      sessionId: req.sessionID 
    }, '✅ User attached to request');
  }
  next();
};

// Middleware to require authentication
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user?.isAuthenticated) {
    logger.warn({ 
      path: req.path, 
      sessionId: req.sessionID 
    }, '⛔ Unauthorized access attempt');
    
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
      logger.warn({ 
        path: req.path, 
        sessionId: req.sessionID 
      }, '⛔ Unauthorized access attempt');
      
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn({ 
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path 
      }, '⛔ Insufficient permissions');
      
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

// Helper to destroy session
export const destroySession = (req: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err: Error) => {
      if (err) {
        logger.error({ error: err }, '❌ Session destroy error');
        reject(err);
      } else {
        logger.info({ sessionId: req.sessionID }, '✅ Session destroyed');
        resolve();
      }
    });
  });
};

// Helper to regenerate session (use after login for security)
export const regenerateSession = (req: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const oldSessionId = req.sessionID;
    
    req.session.regenerate((err: Error) => {
      if (err) {
        logger.error({ error: err }, '❌ Session regenerate error');
        reject(err);
      } else {
        logger.info({ 
          oldSessionId, 
          newSessionId: req.sessionID 
        }, '✅ Session regenerated');
        resolve();
      }
    });
  });
};

