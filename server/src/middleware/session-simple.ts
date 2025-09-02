import session from 'express-session';
import { logger } from '../logger';

// Session configuration (memory store)
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-here-minimum-16-chars',
  name: 'craved.sid',
  cookie: {
    httpOnly: true,
    secure: false, // Always false for development
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    path: '/',
    domain: 'localhost' // Allow cookies across localhost subdomains
  },
  resave: true, // Changed to true for development
  saveUninitialized: true, // Changed to true for development
  rolling: true
});

// Middleware to attach user to request
export const attachUser = (req: any, res: any, next: any) => {
  console.log('🔍 [DEBUG] AttachUser middleware called');
  console.log('🔍 [DEBUG] Session ID:', req.sessionID);
  console.log('🔍 [DEBUG] Has session:', !!req.session);
  console.log('🔍 [DEBUG] Session data:', JSON.stringify(req.session, null, 2));
  
  logger.info({ 
    sessionId: req.sessionID, 
    hasSession: !!req.session, 
    sessionData: req.session 
  }, 'AttachUser middleware');
  
  if (req.session.userId) {
    req.user = {
      userId: req.session.userId,
      email: req.session.email,
      role: req.session.role,
      isAuthenticated: true,
      lastActivity: new Date()
    };
    console.log('🔍 [DEBUG] User attached:', req.user);
    logger.info({ userId: req.user.userId }, 'User attached to request');
  } else {
    console.log('🔍 [DEBUG] No user session found');
    logger.info('No user session found');
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
