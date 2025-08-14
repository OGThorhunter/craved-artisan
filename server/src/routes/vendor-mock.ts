import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth-mock';

const router = express.Router();

// Mock vendor profile data
let mockVendorProfile = {
  id: 'mock-vendor-id',
  userId: 'dev-user-id',
  storeName: 'Mock Artisan Store',
  slug: 'mock-artisan-store',
  bio: 'A wonderful mock artisan store for testing purposes.',
  imageUrl: 'https://placekitten.com/400/300',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// GET /api/vendor/profile
router.get('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Simulate database lookup
    if (req.session.userId === 'dev-user-id') {
      return res.json(mockVendorProfile);
    } else {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'No vendor profile exists for this user'
      });
    }
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch vendor profile'
    });
  }
});

// PUT /api/vendor/profile
router.put('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { storeName, bio, imageUrl } = req.body;
    
    if (!storeName) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Store name is required'
      });
    }
    
    // Generate slug from store name
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Update mock profile
    mockVendorProfile = {
      ...mockVendorProfile,
      storeName,
      bio: bio || null,
      imageUrl: imageUrl || null,
      slug,
      updatedAt: new Date().toISOString()
    };
    
    return res.json(mockVendorProfile);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to update vendor profile'
    });
  }
});

// GET /api/vendors/:id/delivery-metrics/test - Mock delivery analytics for vendor
router.get('/:id/delivery-metrics/test', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock delivery metrics data
    const mockDeliveryMetrics = {
      zipStats: [
        { zip: '30248', delivered: 12, delayed: 3 },
        { zip: '30301', delivered: 8, delayed: 1 },
        { zip: '30305', delivered: 15, delayed: 2 },
        { zip: '30308', delivered: 6, delayed: 4 },
        { zip: '30309', delivered: 10, delayed: 1 }
      ],
      onTimeRate: 0.91,
      avgTimeToDeliver: "2.3h",
      totalOrders: 75,
      totalDelivered: 51,
      onTimeDeliveries: 46,
      delayedDeliveries: 5
    };

    return res.json(mockDeliveryMetrics);
  } catch (error) {
    console.error('Error fetching mock delivery metrics:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch delivery metrics'
    });
  }
});

export default router; 