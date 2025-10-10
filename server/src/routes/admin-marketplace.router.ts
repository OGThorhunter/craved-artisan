import { Router } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin-auth';
import { vendorManagementService } from '../services/vendor-management';
import { z } from 'zod';

const router = Router();

// Validation schemas
const VendorSearchSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  rating: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  isActive: z.boolean().optional(),
  hasActiveProducts: z.boolean().optional(),
  sortBy: z.enum(['name', 'rating', 'revenue', 'orders', 'created']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const VendorSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  criteria: z.object({
    tags: z.array(z.string()).optional(),
    rating: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    orderCount: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    revenue: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    lastLoginDays: z.number().optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    isActive: z.boolean().optional(),
    hasActiveProducts: z.boolean().optional(),
    hasActiveSalesWindows: z.boolean().optional(),
    createdAfter: z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional()
  })
});

const BroadcastMessageSchema = z.object({
  segmentId: z.string(),
  scope: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.any()).optional()
});

// GET /api/admin/marketplace/vendors - Search vendors
router.get('/marketplace/vendors', requireAdmin, async (req, res) => {
  try {
    const filters = VendorSearchSchema.parse(req.query);
    const result = await vendorManagementService.searchVendors(filters);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Vendor search error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid search parameters',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/marketplace/vendors/:id - Get vendor profile
router.get('/marketplace/vendors/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await vendorManagementService.getVendorProfile(id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    return res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor profile'
    });
  }
});

// GET /api/admin/marketplace/analytics - Get vendor analytics
router.get('/marketplace/analytics', requireAdmin, async (req, res) => {
  try {
    const analytics = await vendorManagementService.getVendorAnalytics();
    
    return res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor analytics'
    });
  }
});

// GET /api/admin/marketplace/segments - Get vendor segments
router.get('/marketplace/segments', requireAdmin, async (req, res) => {
  try {
    const segments = await vendorManagementService.getVendorSegments();
    
    return res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    console.error('Vendor segments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor segments'
    });
  }
});

// POST /api/admin/marketplace/segments - Create vendor segment
router.post('/marketplace/segments', requireAdmin, auditAdminAction('vendor.segment.create'), async (req, res) => {
  try {
    const data = VendorSegmentSchema.parse(req.body);
    const segment = await vendorManagementService.createVendorSegment(data);
    
    return res.status(201).json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Create vendor segment error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid segment data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/marketplace/segments/:id - Get vendor segment
router.get('/marketplace/segments/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const segments = await vendorManagementService.getVendorSegments();
    const segment = segments.find(s => s.id === id);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }
    
    return res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Get vendor segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor segment'
    });
  }
});

// GET /api/admin/marketplace/segments/:id/vendors - Get vendors in segment
router.get('/marketplace/segments/:id/vendors', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const vendors = await vendorManagementService.getSegmentVendors(id);
    
    return res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Get segment vendors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch segment vendors'
    });
  }
});

// PUT /api/admin/marketplace/segments/:id - Update vendor segment
router.put('/marketplace/segments/:id', requireAdmin, auditAdminAction('vendor.segment.update'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = VendorSegmentSchema.partial().parse(req.body);
    const segment = await vendorManagementService.updateVendorSegment(id, data);
    
    return res.json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Update vendor segment error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid segment update data',
      error: (error as Error).message
    });
  }
});

// DELETE /api/admin/marketplace/segments/:id - Delete vendor segment
router.delete('/marketplace/segments/:id', requireAdmin, auditAdminAction('vendor.segment.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await vendorManagementService.deleteVendorSegment(id);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Segment deleted successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete segment'
      });
    }
  } catch (error) {
    console.error('Delete vendor segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete segment'
    });
  }
});

// POST /api/admin/marketplace/segments/:id/broadcast - Broadcast message to segment
router.post('/marketplace/segments/:id/broadcast', requireAdmin, auditAdminAction('vendor.segment.broadcast'), async (req, res) => {
  try {
    const { id } = req.params;
    const message = BroadcastMessageSchema.parse(req.body);
    
    // Ensure segmentId matches the URL parameter
    message.segmentId = id;
    
    const result = await vendorManagementService.broadcastToSegment(id, message);
    
    if (result.success) {
      return res.json({
        success: true,
        message: `Message broadcast to ${result.vendorCount} vendors`,
        data: { vendorCount: result.vendorCount }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to broadcast message'
      });
    }
  } catch (error) {
    console.error('Broadcast message error:', error);
    return res.status(400).json({
      success: false,
      message: 'Invalid broadcast data',
      error: (error as Error).message
    });
  }
});

// GET /api/admin/marketplace/segments/:id/count - Get segment vendor count
router.get('/marketplace/segments/:id/count', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const count = await vendorManagementService.getSegmentVendorCount(id);
    
    return res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get segment count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get segment count'
    });
  }
});

export default router;



















