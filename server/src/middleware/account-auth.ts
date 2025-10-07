import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { logger } from '../logger';

// Extend Request interface to include account context
declare global {
  namespace Express {
    interface Request {
      account?: {
        id: string;
        name: string;
        slug: string;
        ownerId: string;
      };
      accountUser?: {
        id: string;
        role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
        status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
        title?: string;
        workEmail?: string;
        workPhone?: string;
      };
      user?: {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        avatarUrl?: string;
        isAuthenticated: boolean;
        lastActivity: Date;
      };
    }
  }
}

// Middleware to load account context from session or header
export const loadAccountContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get account slug from header or session
    const accountSlug = req.headers['x-account-slug'] as string || req.session?.accountSlug;
    
    if (!accountSlug) {
      return res.status(400).json({
        success: false,
        message: 'Account context required'
      });
    }

    // Load account and user relationship
    const accountUser = await prisma.accountUser.findFirst({
      where: {
        userId: req.user?.userId,
        account: {
          slug: accountSlug,
          deletedAt: null
        },
        status: 'ACTIVE'
      },
      include: {
        account: true,
        user: true
      }
    });

    if (!accountUser) {
      return res.status(403).json({
        success: false,
        message: 'Account access denied'
      });
    }

    // Attach account context to request
    req.account = {
      id: accountUser.account.id,
      name: accountUser.account.name,
      slug: accountUser.account.slug,
      ownerId: accountUser.account.ownerId
    };

    req.accountUser = {
      id: accountUser.id,
      role: accountUser.role as 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER',
      status: accountUser.status as 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED',
      title: accountUser.title,
      workEmail: accountUser.workEmail,
      workPhone: accountUser.workPhone
    };

    next();
  } catch (error) {
    logger.error({ error }, 'Error loading account context');
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to require account context
export const requireAccountContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.account || !req.accountUser) {
    return res.status(400).json({
      success: false,
      message: 'Account context required'
    });
  }
  next();
};

// Middleware to require specific account role
export const requireAccountRole = (roles: ('OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.accountUser) {
      return res.status(400).json({
        success: false,
        message: 'Account context required'
      });
    }

    if (!roles.includes(req.accountUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to require owner or admin role
export const requireOwnerOrAdmin = requireAccountRole(['OWNER', 'ADMIN']);

// Middleware to require owner role only
export const requireOwner = requireAccountRole(['OWNER']);

// Middleware to check if user can manage team (OWNER or ADMIN)
export const canManageTeam = requireAccountRole(['OWNER', 'ADMIN']);

// Middleware to check if user can manage organization (OWNER or ADMIN)
export const canManageOrganization = requireAccountRole(['OWNER', 'ADMIN']);

// Middleware to check if user can view sensitive data (OWNER, ADMIN, or STAFF)
export const canViewSensitiveData = requireAccountRole(['OWNER', 'ADMIN', 'STAFF']);

// Middleware to prevent removing last owner
export const preventRemoveLastOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountUserId } = req.params;
    const accountId = req.account!.id;

    // Get the account user being modified
    const accountUser = await prisma.accountUser.findFirst({
      where: {
        id: accountUserId,
        accountId: accountId
      }
    });

    if (!accountUser) {
      return res.status(404).json({
        success: false,
        message: 'Account user not found'
      });
    }

    // If trying to change role from OWNER to something else
    if (accountUser.role === 'OWNER' && req.body.role && req.body.role !== 'OWNER') {
      // Check if this is the last owner
      const ownerCount = await prisma.accountUser.count({
        where: {
          accountId: accountId,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });

      if (ownerCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last owner of the account'
        });
      }
    }

    next();
  } catch (error) {
    logger.error({ error }, 'Error checking last owner constraint');
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Audit logging middleware
export const auditLog = (action: string, entityType: string, entityId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Log audit entry after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        prisma.auditLog.create({
          data: {
            accountId: req.account!.id,
            actorUserId: req.user!.userId,
            action: action,
            entityType: entityType,
            entityId: entityId || req.params.id || 'unknown',
            diffJson: req.method !== 'GET' ? req.body : null,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }
        }).catch(error => {
          logger.error({ error }, 'Failed to create audit log');
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Rate limiting for sensitive operations
export const rateLimitSensitive = (windowMs: number = 60000, max: number = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.user?.userId}`;
    const now = Date.now();
    
    const attempt = attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (attempt.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    attempt.count++;
    next();
  };
};




