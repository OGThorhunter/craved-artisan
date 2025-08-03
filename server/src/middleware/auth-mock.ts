import { Request, Response, NextFunction } from 'express';

// Mock Role enum
enum Role {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  SUPPLIER = 'SUPPLIER',
  EVENT_COORDINATOR = 'EVENT_COORDINATOR',
  DROPOFF = 'DROPOFF'
}

// Mock user data
const mockUsers = [
  {
    id: 'test-user-id',
    email: 'test@example.com',
    role: Role.CUSTOMER
  },
  {
    id: 'mock-user-id',
    email: 'vendor@cravedartisan.com',
    role: Role.VENDOR
  },
  {
    id: 'user-1',
    email: 'vendor1@example.com',
    role: Role.VENDOR
  },
  {
    id: 'user-2',
    email: 'vendor2@example.com',
    role: Role.VENDOR
  },
  {
    id: 'user-admin',
    email: 'admin@example.com',
    role: Role.ADMIN
  }
];

// Extend Request interface to include session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Require authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Find user in mock data
    const user = mockUsers.find(u => u.id === req.session.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'User not found'
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

// Require specific role middleware
export const requireRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        });
      }

      // Find user in mock data
      const user = mockUsers.find(u => u.id === req.session.userId);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid session',
          message: 'User not found'
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role as Role)) {
        return res.status(403).json({
          error: 'Access denied',
          message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      // Attach user to request
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Authorization failed'
      });
    }
  };
}; 