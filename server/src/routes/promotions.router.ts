import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';
import { cachePromotionsData, invalidateOnMutation } from '../middleware/promotionsCache';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Apply performance optimizations
router.use(invalidateOnMutation()); // Invalidate cache on mutations
router.use('/campaigns', cachePromotionsData(5 * 60 * 1000)); // Cache campaigns for 5 minutes
router.use('/promotions', cachePromotionsData(5 * 60 * 1000)); // Cache promotions for 5 minutes

// Helper function to authenticate and get vendor profile
async function authenticateVendor(req: any) {
  console.log('🔍 [DEBUG] Promotions authenticateVendor - req.user:', req.user);
  
  const vendorId = req.user?.userId;
  if (!vendorId) {
    console.log('🔍 [DEBUG] Promotions authenticateVendor - No vendorId found');
    const error = new Error('Authentication required');
    (error as any).statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user) {
    const error = new Error('User not found');
    (error as any).statusCode = 404;
    throw error;
  }

  if (!user.vendorProfile) {
    const error = new Error('Vendor profile required');
    (error as any).statusCode = 403;
    throw error;
  }

  if ((user as any).role !== 'VENDOR') {
    const error = new Error('Vendor access required');
    (error as any).statusCode = 403;
    throw error;
  }

  return user.vendorProfile;
}

// Validation schemas
const CampaignCreateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  type: z.enum(['PROMOTIONAL', 'SEASONAL', 'PRODUCT_LAUNCH', 'CLEARANCE', 'LOYALTY', 'REFERRAL']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  targetAudience: z.string().optional(),
  budget: z.number().optional()
});

const CampaignUpdateSchema = CampaignCreateSchema.partial();

const PromotionCreateSchema = z.object({
  campaignId: z.string().optional(),
  name: z.string().min(1, 'Promotion name is required'),
  description: z.string().optional(),
  type: z.enum(['DISCOUNT_CODE', 'AUTOMATIC_DISCOUNT', 'BOGO', 'FREE_SHIPPING', 'LOYALTY_BONUS', 'REFERRAL_REWARD']),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
  discountValue: z.number().min(0),
  code: z.string().optional(),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  applicableProducts: z.array(z.string()).optional(),
  customerSegments: z.array(z.string()).optional()
});

const PromotionUpdateSchema = PromotionCreateSchema.partial();

// ================================
// CAMPAIGN ENDPOINTS
// ================================

// GET /api/vendor/promotions/campaigns - Get all campaigns for vendor
router.get('/campaigns', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    
    const campaigns = await prisma.campaign.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        promotions: {
          select: {
            id: true,
            name: true,
            type: true,
            status: 'active' as any
          }
        },
        socialPosts: {
          select: {
            id: true,
            status: true
          }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        _count: {
          select: {
            promotions: true,
            socialPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      campaignCount: campaigns.length
    }, 'Retrieved campaigns for vendor');

    res.json({
      success: true,
      data: campaigns
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting campaigns');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/promotions/campaigns - Create new campaign
router.post('/campaigns', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = CampaignCreateSchema.parse(req.body);

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        targetAudience: validatedData.targetAudience ? JSON.stringify(validatedData.targetAudience) : null
      },
      include: {
        promotions: true,
        socialPosts: true,
        analytics: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      campaignId: campaign.id,
      campaignName: campaign.name
    }, 'Created new campaign');

    res.status(201).json({
      success: true,
      data: campaign
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating campaign');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// GET /api/vendor/promotions/campaigns/:id - Get specific campaign
router.get('/campaigns/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        promotions: {
          include: {
            analytics: {
              orderBy: { date: 'desc' },
              take: 30
            },
            usageHistory: {
              take: 10,
              orderBy: { usedAt: 'desc' },
              include: {
                user: {
                  select: { id: true, email: true, name: true }
                }
              }
            }
          }
        },
        socialPosts: {
          include: {
            analytics: {
              orderBy: { date: 'desc' },
              take: 30
            }
          }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      campaignId: req.params.id
    }, 'Error getting campaign');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// PUT /api/vendor/promotions/campaigns/:id - Update campaign
router.put('/campaigns/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;
    const validatedData = CampaignUpdateSchema.parse(req.body);

    // Check if campaign exists and belongs to vendor
    const existingCampaign = await prisma.campaign.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...validatedData,
        targetAudience: validatedData.targetAudience ? JSON.stringify(validatedData.targetAudience) : undefined
      },
      include: {
        promotions: true,
        socialPosts: true,
        analytics: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      campaignId: campaign.id
    }, 'Updated campaign');

    res.json({
      success: true,
      data: campaign
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      campaignId: req.params.id
    }, 'Error updating campaign');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// DELETE /api/vendor/promotions/campaigns/:id - Delete campaign
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if campaign exists and belongs to vendor
    const existingCampaign = await prisma.campaign.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    await prisma.campaign.delete({
      where: { id }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      campaignId: id
    }, 'Deleted campaign');

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      campaignId: req.params.id
    }, 'Error deleting campaign');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ================================
// PROMOTION ENDPOINTS
// ================================

// GET /api/vendor/promotions - Get all promotions for vendor
router.get('/', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    
    const promotions = await prisma.promotion.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        campaign: {
          select: { id: true, name: true, type: true }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        usageHistory: {
          take: 5,
          orderBy: { usedAt: 'desc' },
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        },
        _count: {
          select: {
            usageHistory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionCount: promotions.length
    }, 'Retrieved promotions for vendor');

    res.json({
      success: true,
      data: promotions
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting promotions');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/promotions - Create new promotion
router.post('/', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = PromotionCreateSchema.parse(req.body);

    // Check if campaign exists (if campaignId provided)
    if (validatedData.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { 
          id: validatedData.campaignId,
          vendorProfileId: vendorProfile.id 
        }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campaign not found'
        });
      }
    }

    // Check for duplicate codes if code is provided
    if (validatedData.code) {
      const existingPromotion = await prisma.promotion.findFirst({
        where: { code: validatedData.code }
      });

      if (existingPromotion) {
        return res.status(409).json({
          success: false,
          error: 'Promotion code already exists'
        });
      }
    }

    const promotion = await prisma.promotion.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        applicableProducts: validatedData.applicableProducts ? JSON.stringify(validatedData.applicableProducts) : null,
        customerSegments: validatedData.customerSegments ? JSON.stringify(validatedData.customerSegments) : null
      },
      include: {
        campaign: true,
        analytics: true,
        usageHistory: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionId: promotion.id,
      promotionName: promotion.name,
      code: promotion.code
    }, 'Created new promotion');

    res.status(201).json({
      success: true,
      data: promotion
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating promotion');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// GET /api/vendor/promotions/:id - Get specific promotion
router.get('/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    const promotion = await prisma.promotion.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        campaign: true,
        analytics: {
          orderBy: { date: 'desc' },
          take: 30
        },
        usageHistory: {
          take: 20,
          orderBy: { usedAt: 'desc' },
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: promotion
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      promotionId: req.params.id
    }, 'Error getting promotion');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// PUT /api/vendor/promotions/:id - Update promotion
router.put('/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;
    const validatedData = PromotionUpdateSchema.parse(req.body);

    // Check if promotion exists and belongs to vendor
    const existingPromotion = await prisma.promotion.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingPromotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    // Check for duplicate codes if code is being updated
    if (validatedData.code && validatedData.code !== existingPromotion.code) {
      const duplicatePromotion = await prisma.promotion.findFirst({
        where: { 
          code: validatedData.code,
          id: { not: id }
        }
      });

      if (duplicatePromotion) {
        return res.status(409).json({
          success: false,
          error: 'Promotion code already exists'
        });
      }
    }

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...validatedData,
        applicableProducts: validatedData.applicableProducts ? JSON.stringify(validatedData.applicableProducts) : undefined,
        customerSegments: validatedData.customerSegments ? JSON.stringify(validatedData.customerSegments) : undefined
      },
      include: {
        campaign: true,
        analytics: true,
        usageHistory: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionId: promotion.id
    }, 'Updated promotion');

    res.json({
      success: true,
      data: promotion
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      promotionId: req.params.id
    }, 'Error updating promotion');

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// DELETE /api/vendor/promotions/:id - Delete promotion
router.delete('/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if promotion exists and belongs to vendor
    const existingPromotion = await prisma.promotion.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingPromotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    await prisma.promotion.delete({
      where: { id }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionId: id
    }, 'Deleted promotion');

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      promotionId: req.params.id
    }, 'Error deleting promotion');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/promotions/:id/toggle - Toggle promotion active status
router.post('/:id/toggle', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    // Check if promotion exists and belongs to vendor
    const existingPromotion = await prisma.promotion.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingPromotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        isActive: !existingPromotion.isActive
      },
      include: {
        campaign: true,
        analytics: true
      }
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      promotionId: promotion.id,
      newStatus: promotion.isActive
    }, 'Toggled promotion status');

    res.json({
      success: true,
      data: promotion
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      promotionId: req.params.id
    }, 'Error toggling promotion');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export { router as promotionsRouter };
