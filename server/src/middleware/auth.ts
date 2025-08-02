import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

// Middleware to check if user is authenticated
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        role: true,
      }
    });

    if (!user) {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Please log in again'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication check failed'
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole([Role.ADMIN]);

// Middleware to check if user is vendor
export const requireVendor = requireRole([Role.VENDOR]);

// Middleware to check if user is customer
export const requireCustomer = requireRole([Role.CUSTOMER]);

// Middleware to check if user is vendor or admin
export const requireVendorOrAdmin = requireRole([Role.VENDOR, Role.ADMIN]);

// Optional auth middleware - doesn't fail if no user, but attaches user if available
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: {
          id: true,
          email: true,
          role: true,
        }
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Don't fail the request, just continue without user
    next();
  }
}; 