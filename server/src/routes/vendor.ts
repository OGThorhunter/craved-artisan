import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
const router = express.Router();

// GET /api/vendor/profile
router.get('/profile', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });
    
    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'No vendor profile exists for this user'
      });
    }
    
    res.json(vendor);
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
    
    const vendor = await prisma.vendorProfile.upsert({
      where: { userId: req.session.userId },
      update: { 
        storeName, 
        bio, 
        imageUrl,
        slug: slug // Update slug in case store name changed
      },
      create: {
        userId: req.session.userId,
        storeName,
        slug,
        bio,
        imageUrl,
      },
    });
    
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A vendor profile with this store name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update vendor profile'
    });
  }
});

export default router; 