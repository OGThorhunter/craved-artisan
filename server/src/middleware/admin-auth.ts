import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface for admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
        isAuthenticated: boolean;
        lastActivity: Date;
      };
    }
  }
}

// Admin IP allowlist (in production, this should be in environment variables)
const ADMIN_ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  'localhost',
  '::ffff:127.0.0.1', // IPv4-mapped IPv6
  '0.0.0.0', // Allow all for development
  // Add your production admin IPs here
];

// Middleware to require admin authentication
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check IP allowlist
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const forwardedIP = req.headers['x-forwarded-for'] as string;
    const realIP = forwardedIP ? forwardedIP.split(',')[0].trim() : clientIP;
    
    // Skip IP check for development
    if (process.env.NODE_ENV === 'production' && !ADMIN_ALLOWED_IPS.includes(realIP) && !ADMIN_ALLOWED_IPS.includes(clientIP)) {
      console.log(`🔒 Admin access denied for IP: ${realIP || clientIP}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied: IP not in allowlist'
      });
    }

    // Check session authentication
    if (!req.user?.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Attach admin info to request
    req.admin = {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      isAuthenticated: true,
      lastActivity: new Date()
    };

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to audit admin actions
export const auditAdminAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only audit successful mutations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.admin) {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const forwardedIP = req.headers['x-forwarded-for'] as string;
        const realIP = forwardedIP ? forwardedIP.split(',')[0].trim() : clientIP;
        
        // Extract target from request (e.g., vendor ID, order ID)
        let target: string | undefined;
        if (req.params.id) {
          target = `${req.route?.path?.split('/')[1] || 'unknown'}:${req.params.id}`;
        }
        
        // Log admin action asynchronously
        prisma.adminAudit.create({
          data: {
            adminId: req.admin.id,
            action,
            target,
            payload: {
              method: req.method,
              path: req.path,
              body: req.method !== 'GET' ? req.body : undefined,
              timestamp: new Date().toISOString()
            },
            ip: realIP || clientIP
          }
        }).catch(error => {
          console.error('Failed to audit admin action:', error);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware for step-up authentication on sensitive actions
export const requireStepUp = async (req: Request, res: Response, next: NextFunction) => {
  // For now, just require admin role
  // In production, this would check for recent 2FA or additional verification
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Step-up authentication required'
    });
  }
  
  next();
};

// Helper to get admin audit log
export const getAdminAuditLog = async (page: number = 1, limit: number = 50, filters?: {
  adminId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (filters?.adminId) where.adminId = filters.adminId;
  if (filters?.action) where.action = { contains: filters.action };
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }
  
  const [audits, total] = await Promise.all([
    prisma.adminAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.adminAudit.count({ where })
  ]);
  
  return {
    audits,
    pagination: {
      page,
      limit,
      total,
      pageCount: Math.ceil(total / limit)
    }
  };
};
