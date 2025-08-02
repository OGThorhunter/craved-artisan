import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, requireAdmin, requireVendor, requireCustomer } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Example protected route that requires authentication
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'Protected profile route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Example route that requires VENDOR role
router.get('/vendor-dashboard', requireAuth, requireVendor, (req: Request, res: Response) => {
  res.json({
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
router.get('/admin-panel', requireAuth, requireAdmin, (req: Request, res: Response) => {
  res.json({
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
router.get('/customer-orders', requireAuth, requireCustomer, (req: Request, res: Response) => {
  res.json({
    message: 'Customer orders - only CUSTOMER users can access',
    user: req.user,
    orders: [],
    timestamp: new Date().toISOString()
  });
});

// Example route that allows multiple roles
router.get('/vendor-or-admin', requireAuth, requireRole([Role.VENDOR, Role.ADMIN]), (req: Request, res: Response) => {
  res.json({
    message: 'Vendor or Admin route - VENDOR and ADMIN users can access',
    user: req.user,
    data: {
      permissions: req.user?.role === 'ADMIN' ? 'full' : 'limited'
    },
    timestamp: new Date().toISOString()
  });
});

// Example route that requires specific role using requireRole function
router.get('/supplier-only', requireAuth, requireRole([Role.SUPPLIER]), (req: Request, res: Response) => {
  res.json({
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
router.get('/event-management', requireAuth, requireRole([Role.EVENT_COORDINATOR]), (req: Request, res: Response) => {
  res.json({
    message: 'Event management - only EVENT_COORDINATOR users can access',
    user: req.user,
    events: [],
    timestamp: new Date().toISOString()
  });
});

// Example route that requires DROPOFF role
router.get('/dropoff-locations', requireAuth, requireRole([Role.DROPOFF]), (req: Request, res: Response) => {
  res.json({
    message: 'Dropoff locations - only DROPOFF users can access',
    user: req.user,
    locations: [],
    timestamp: new Date().toISOString()
  });
});

export default router; 