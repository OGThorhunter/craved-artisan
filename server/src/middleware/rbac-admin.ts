import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const prisma = new PrismaClient();

export type AdminRole = 'SUPER_ADMIN' | 'STAFF_ADMIN' | 'SUPPORT' | 'FINANCE';

interface AdminPermissions {
  canRead: string[];
  canWrite: string[];
  canDelete: boolean;
  canImpersonate: boolean;
  canExportPayouts: boolean;
  canManageRoles: boolean;
  canPrivacyOps: boolean;
}

/**
 * Permission definitions for each admin role
 */
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  SUPER_ADMIN: {
    canRead: ['*'],
    canWrite: ['*'],
    canDelete: true,
    canImpersonate: true,
    canExportPayouts: true,
    canManageRoles: true,
    canPrivacyOps: true
  },
  STAFF_ADMIN: {
    canRead: ['users', 'orders', 'vendors', 'analytics', 'support'],
    canWrite: ['users', 'orders', 'vendors', 'support'],
    canDelete: false,
    canImpersonate: false,
    canExportPayouts: false,
    canManageRoles: false,
    canPrivacyOps: false
  },
  SUPPORT: {
    canRead: ['users', 'orders', 'tickets', 'messages'],
    canWrite: ['tickets', 'messages'],
    canDelete: false,
    canImpersonate: false,
    canExportPayouts: false,
    canManageRoles: false,
    canPrivacyOps: false
  },
  FINANCE: {
    canRead: ['orders', 'payouts', 'fees', 'revenue', 'analytics'],
    canWrite: [],
    canDelete: false,
    canImpersonate: false,
    canExportPayouts: true,
    canManageRoles: false,
    canPrivacyOps: false
  }
};

/**
 * Get admin role from user
 */
async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { in: ['SUPER_ADMIN', 'STAFF_ADMIN', 'SUPPORT', 'FINANCE'] }
    }
  });
  
  return userRole?.role as AdminRole | null;
}

/**
 * Check if admin has permission for an action
 */
export function hasPermission(
  permissions: AdminPermissions,
  action: 'read' | 'write' | 'delete' | 'impersonate' | 'exportPayouts' | 'manageRoles' | 'privacyOps',
  resource?: string
): boolean {
  switch (action) {
    case 'read':
      if (permissions.canRead.includes('*')) return true;
      return resource ? permissions.canRead.includes(resource) : false;
    
    case 'write':
      if (permissions.canWrite.includes('*')) return true;
      return resource ? permissions.canWrite.includes(resource) : false;
    
    case 'delete':
      return permissions.canDelete;
    
    case 'impersonate':
      return permissions.canImpersonate;
    
    case 'exportPayouts':
      return permissions.canExportPayouts;
    
    case 'manageRoles':
      return permissions.canManageRoles;
    
    case 'privacyOps':
      return permissions.canPrivacyOps;
    
    default:
      return false;
  }
}

/**
 * Middleware to require specific admin permission
 */
export const requirePermission = (
  action: 'read' | 'write' | 'delete' | 'impersonate' | 'exportPayouts' | 'manageRoles' | 'privacyOps',
  resource?: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin authentication required'
        });
      }
      
      const adminRole = await getAdminRole(req.admin.id);
      
      if (!adminRole) {
        return res.status(403).json({
          success: false,
          message: 'Admin role not found'
        });
      }
      
      const permissions = ROLE_PERMISSIONS[adminRole];
      
      if (!hasPermission(permissions, action, resource)) {
        logger.warn(`Permission denied for admin ${req.admin.id} (${adminRole}) - ${action} on ${resource}`);
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions: ${adminRole} cannot ${action} ${resource || 'this resource'}`
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Middleware to require Super Admin role
 */
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }
    
    const adminRole = await getAdminRole(req.admin.id);
    
    if (adminRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super Admin access required'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Super Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Permission check failed'
    });
  }
};

/**
 * Get permissions for current admin user
 */
export async function getAdminPermissions(adminId: string): Promise<AdminPermissions | null> {
  const adminRole = await getAdminRole(adminId);
  return adminRole ? ROLE_PERMISSIONS[adminRole] : null;
}

/**
 * Attach admin permissions to request
 */
export const attachPermissions = async (req: Request, res: Response, next: NextFunction) => {
  if (req.admin) {
    const permissions = await getAdminPermissions(req.admin.id);
    if (permissions) {
      (req as any).adminPermissions = permissions;
    }
  }
  next();
};

