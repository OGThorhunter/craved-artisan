import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth-mock';

const router = express.Router();

// Mock vendor profile data
let mockVendorProfile = {
  id: 'mock-vendor-id',
  userId: 'mock-user-id',
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
    if (req.session.userId === 'mock-user-id') {
      res.json(mockVendorProfile);
    } else {
      res.status(404).json({
        error: 'Vendor profile not found',
        message: 'No vendor profile exists for this user'
      });
    }
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({
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
    
    res.json(mockVendorProfile);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update vendor profile'
    });
  }
});

export default router; 