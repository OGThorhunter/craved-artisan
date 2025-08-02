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

// GET /api/vendors/:id/delivery-metrics - Get delivery analytics for vendor
router.get('/:id/delivery-metrics', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify vendor exists and user has access
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'Vendor does not exist'
      });
    }

    // Get all orders for this vendor with delivery data
    const orders = await prisma.order.findMany({
      where: { vendorId: id },
      select: {
        id: true,
        shippingZip: true,
        deliveryStatus: true,
        deliveryTimestamp: true,
        createdAt: true,
        deliveryDay: true
      }
    });

    // Calculate delivery metrics
    const deliveredOrders = orders.filter(order => order.deliveryStatus === 'delivered');
    const totalDelivered = deliveredOrders.length;
    const totalOrders = orders.length;

    // Calculate on-time rate (mock logic - in real app would compare with promised delivery time)
    const onTimeDeliveries = deliveredOrders.filter(order => {
      // Mock logic: consider on-time if delivered within 2 days of order
      const orderDate = new Date(order.createdAt);
      const deliveryDate = order.deliveryTimestamp ? new Date(order.deliveryTimestamp) : null;
      if (!deliveryDate) return false;
      
      const daysDiff = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 2;
    }).length;

    const onTimeRate = totalDelivered > 0 ? onTimeDeliveries / totalDelivered : 0;

    // Calculate average delivery time
    const deliveryTimes = deliveredOrders
      .filter(order => order.deliveryTimestamp)
      .map(order => {
        const orderDate = new Date(order.createdAt);
        const deliveryDate = new Date(order.deliveryTimestamp!);
        return (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60); // hours
      });

    const avgTimeToDeliver = deliveryTimes.length > 0 
      ? (deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length).toFixed(1)
      : "0.0";

    // Calculate ZIP code statistics
    const zipStats = orders.reduce((acc, order) => {
      const zip = order.shippingZip;
      if (!acc[zip]) {
        acc[zip] = { zip, delivered: 0, delayed: 0 };
      }
      
      if (order.deliveryStatus === 'delivered') {
        // Check if delivery was on time (same mock logic as above)
        const orderDate = new Date(order.createdAt);
        const deliveryDate = order.deliveryTimestamp ? new Date(order.deliveryTimestamp) : null;
        if (deliveryDate) {
          const daysDiff = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff <= 2) {
            acc[zip].delivered++;
          } else {
            acc[zip].delayed++;
          }
        }
      }
      
      return acc;
    }, {} as Record<string, { zip: string; delivered: number; delayed: number }>);

    const zipStatsArray = Object.values(zipStats);

    res.json({
      zipStats: zipStatsArray,
      onTimeRate: Math.round(onTimeRate * 100) / 100, // Round to 2 decimal places
      avgTimeToDeliver: `${avgTimeToDeliver}h`,
      totalOrders,
      totalDelivered,
      onTimeDeliveries,
      delayedDeliveries: totalDelivered - onTimeDeliveries
    });
  } catch (error) {
    console.error('Error fetching delivery metrics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch delivery metrics'
    });
  }
});

export default router; 