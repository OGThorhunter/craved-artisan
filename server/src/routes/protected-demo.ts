import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '../lib/prisma';

const router = Router();

// Mock user data for demonstration
const mockUsers = {
  'test-user-id': {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'CUSTOMER' as const
  }
};

// Mock requireAuth middleware for demonstration
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(400).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  const user = mockUsers[req.session.userId as keyof typeof mockUsers];
  if (!user) {
    return res.status(400).json({ 
      error: 'Invalid session',
      message: 'Please log in again'
    });
  }

  req.user = user;
  return next();
};

// Mock requireRole middleware for demonstration
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(400).json({ 
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(400).json({ 
        error: 'Access denied',
        message: 'You do not have permission to access this resource'
      });
    }

    return next();
  };
};

// Example protected route that requires authentication
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  return res.json({
    message: 'Protected profile route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example route that requires VENDOR role
router.get('/vendor-dashboard', requireAuth, requireRole([Role.VENDOR]), (req: Request, res: Response) => {
  return res.json({
    message: 'Vendor dashboard - only VENDOR users can access',
    user: req.user,
    dashboard: {
      products: [],
      orders: [],
      analytics: {}
    },
    timestamp: new Date().toISOString()
  });
});

// Example route that requires ADMIN role
router.get('/admin-panel', requireAuth, requireRole([Role.ADMIN]), (req: Request, res: Response) => {
  return res.json({
    message: 'Admin panel - only ADMIN users can access',
    user: req.user,
    adminData: {
      users: [],
      systemStats: {},
      logs: []
    },
    timestamp: new Date().toISOString()
  });
});

// Example route that requires CUSTOMER role
router.get('/customer-orders', requireAuth, requireRole([Role.CUSTOMER]), (req: Request, res: Response) => {
  return res.json({
    message: 'Customer orders - only CUSTOMER users can access',
    user: req.user,
    orders: [],
    timestamp: new Date().toISOString()
  });
});

// Example route that allows multiple roles
router.get('/vendor-or-admin', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), (req: Request, res: Response) => {
  return res.json({
    message: 'Vendor or Admin route - VENDOR and ADMIN users can access',
    user: req.user,
    data: {
      permissions: req.user?.role === Role.ADMIN ? 'full' : 'limited'
    },
    timestamp: new Date().toISOString()
  });
});

// Example route that requires specific role
router.get('/supplier-only', requireAuth, requireRole(['SUPPLIER']), (req: Request, res: Response) => {
  return res.json({
    message: 'Supplier only route - only SUPPLIER users can access',
    user: req.user,
    supplierData: {
      inventory: [],
      shipments: []
    },
    timestamp: new Date().toISOString()
  });
});

// Example route that requires EVENT_COORDINATOR role
router.get('/event-management', requireAuth, requireRole(['EVENT_COORDINATOR']), (req: Request, res: Response) => {
  return res.json({
    message: 'Event management - only EVENT_COORDINATOR users can access',
    user: req.user,
    events: [],
    timestamp: new Date().toISOString()
  });
});

// Example route that requires DROPOFF role
router.get('/dropoff-locations', requireAuth, requireRole(['DROPOFF']), (req: Request, res: Response) => {
  return res.json({
    message: 'Dropoff locations - only DROPOFF users can access',
    user: req.user,
    locations: [],
    timestamp: new Date().toISOString()
  });
});

export default router; 
