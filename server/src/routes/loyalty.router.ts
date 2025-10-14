import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to authenticate and get vendor profile
async function authenticateVendor(req: any) {
  console.log('🔍 [DEBUG] Loyalty authenticateVendor - req.user:', req.user);
  
  const vendorId = req.user?.userId;
  if (!vendorId) {
    const error = new Error('Authentication required');
    (error as any).statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user || !user.vendorProfile) {
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
const LoyaltyProgramCreateSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  type: z.enum(['POINTS', 'PUNCH_CARD', 'TIER_BASED', 'HYBRID']),
  pointsPerDollar: z.number().min(0).default(1),
  tierThresholds: z.record(z.number()).optional(),
  rewards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    pointsRequired: z.number(),
    rewardType: z.enum(['DISCOUNT', 'FREE_ITEM', 'UPGRADE']),
    value: z.number(),
    description: z.string().optional()
  })).optional()
});

const LoyaltyProgramUpdateSchema = LoyaltyProgramCreateSchema.partial();

const ReferralProgramCreateSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  referrerReward: z.object({
    type: z.enum(['POINTS', 'DISCOUNT', 'CASH', 'FREE_ITEM']),
    value: z.number(),
    description: z.string().optional()
  }),
  refereeReward: z.object({
    type: z.enum(['POINTS', 'DISCOUNT', 'CASH', 'FREE_ITEM']),
    value: z.number(),
    description: z.string().optional()
  }),
  minimumPurchase: z.number().optional(),
  expirationDays: z.number().optional()
});

const ReferralProgramUpdateSchema = ReferralProgramCreateSchema.partial();

const CustomerSegmentCreateSchema = z.object({
  name: z.string().min(1, 'Segment name is required'),
  description: z.string().optional(),
  criteria: z.object({
    minPurchases: z.number().optional(),
    minSpent: z.number().optional(),
    lastPurchaseDays: z.number().optional(),
    loyaltyTier: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

const LoyaltyTransactionCreateSchema = z.object({
  userId: z.string(),
  type: z.enum(['EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED']),
  points: z.number(),
  description: z.string().optional(),
  orderId: z.string().optional()
});

// ================================
// LOYALTY PROGRAM ENDPOINTS
// ================================

// GET /api/vendor/loyalty/programs - Get all loyalty programs for vendor
router.get('/programs', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    
    const programs = await prisma.loyaltyProgram.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        customerPoints: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            },
            transactions: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        redemptions: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { redeemedAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            customerPoints: true,
            redemptions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields and calculate statistics
    const processedPrograms = programs.map(program => {
      const tierThresholds = program.tierThresholds ? JSON.parse(program.tierThresholds) : null;
      const rewards = program.rewards ? JSON.parse(program.rewards) : [];
      
      const totalCustomers = program.customerPoints.length;
      const totalPointsEarned = program.customerPoints.reduce((sum, cp) => sum + cp.lifetimePoints, 0);
      const totalPointsRedeemed = program.redemptions.reduce((sum, r) => sum + r.pointsRedeemed, 0);

      return {
        ...program,
        tierThresholds,
        rewards,
        stats: {
          totalCustomers,
          totalPointsEarned,
          totalPointsRedeemed,
          activeCustomers: program.customerPoints.filter(cp => cp.points > 0).length,
          avgPointsPerCustomer: totalCustomers > 0 ? Math.round(totalPointsEarned / totalCustomers) : 0
        }
      };
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      programCount: programs.length
    }, 'Retrieved loyalty programs for vendor');

    res.json({
      success: true,
      data: processedPrograms
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting loyalty programs');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/loyalty/programs - Create new loyalty program
router.post('/programs', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = LoyaltyProgramCreateSchema.parse(req.body);

    const program = await prisma.loyaltyProgram.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        tierThresholds: validatedData.tierThresholds ? JSON.stringify(validatedData.tierThresholds) : null,
        rewards: validatedData.rewards ? JSON.stringify(validatedData.rewards) : null
      },
      include: {
        customerPoints: true,
        redemptions: true
      }
    });

    // Parse JSON fields for response
    const processedProgram = {
      ...program,
      tierThresholds: program.tierThresholds ? JSON.parse(program.tierThresholds) : null,
      rewards: program.rewards ? JSON.parse(program.rewards) : []
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      programId: program.id,
      programName: program.name,
      programType: program.type
    }, 'Created new loyalty program');

    res.status(201).json({
      success: true,
      data: processedProgram
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating loyalty program');

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

// GET /api/vendor/loyalty/programs/:id - Get specific loyalty program
router.get('/programs/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;

    const program = await prisma.loyaltyProgram.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      },
      include: {
        customerPoints: {
          include: {
            user: {
              select: { id: true, email: true, name: true, createdAt: true }
            },
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          },
          orderBy: { lifetimePoints: 'desc' }
        },
        redemptions: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { redeemedAt: 'desc' },
          take: 50
        }
      }
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Loyalty program not found'
      });
    }

    // Parse JSON fields and calculate detailed statistics
    const tierThresholds = program.tierThresholds ? JSON.parse(program.tierThresholds) : null;
    const rewards = program.rewards ? JSON.parse(program.rewards) : [];
    
    const totalCustomers = program.customerPoints.length;
    const totalPointsEarned = program.customerPoints.reduce((sum, cp) => sum + cp.lifetimePoints, 0);
    const totalPointsRedeemed = program.redemptions.reduce((sum, r) => sum + r.pointsRedeemed, 0);
    const activeCustomers = program.customerPoints.filter(cp => cp.points > 0).length;
    
    // Tier distribution
    const tierDistribution: { [key: string]: number } = {};
    program.customerPoints.forEach(cp => {
      const tier = cp.tierLevel || 'Bronze';
      tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
    });

    const processedProgram = {
      ...program,
      tierThresholds,
      rewards,
      stats: {
        totalCustomers,
        activeCustomers,
        totalPointsEarned,
        totalPointsRedeemed,
        avgPointsPerCustomer: totalCustomers > 0 ? Math.round(totalPointsEarned / totalCustomers) : 0,
        redemptionRate: totalPointsEarned > 0 ? (totalPointsRedeemed / totalPointsEarned * 100).toFixed(1) : 0,
        tierDistribution,
        topCustomers: program.customerPoints.slice(0, 10),
        recentRedemptions: program.redemptions.slice(0, 10)
      }
    };

    res.json({
      success: true,
      data: processedProgram
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      programId: req.params.id
    }, 'Error getting loyalty program');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// PUT /api/vendor/loyalty/programs/:id - Update loyalty program
router.put('/programs/:id', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id } = req.params;
    const validatedData = LoyaltyProgramUpdateSchema.parse(req.body);

    // Check if program exists and belongs to vendor
    const existingProgram = await prisma.loyaltyProgram.findFirst({
      where: { 
        id,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!existingProgram) {
      return res.status(404).json({
        success: false,
        error: 'Loyalty program not found'
      });
    }

    const program = await prisma.loyaltyProgram.update({
      where: { id },
      data: {
        ...validatedData,
        tierThresholds: validatedData.tierThresholds ? JSON.stringify(validatedData.tierThresholds) : undefined,
        rewards: validatedData.rewards ? JSON.stringify(validatedData.rewards) : undefined
      },
      include: {
        customerPoints: true,
        redemptions: true
      }
    });

    // Parse JSON fields for response
    const processedProgram = {
      ...program,
      tierThresholds: program.tierThresholds ? JSON.parse(program.tierThresholds) : null,
      rewards: program.rewards ? JSON.parse(program.rewards) : []
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      programId: program.id
    }, 'Updated loyalty program');

    res.json({
      success: true,
      data: processedProgram
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      programId: req.params.id
    }, 'Error updating loyalty program');

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

// POST /api/vendor/loyalty/programs/:id/transactions - Add loyalty transaction
router.post('/programs/:id/transactions', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const { id: programId } = req.params;
    const validatedData = LoyaltyTransactionCreateSchema.parse(req.body);

    // Check if program exists and belongs to vendor
    const program = await prisma.loyaltyProgram.findFirst({
      where: { 
        id: programId,
        vendorProfileId: vendorProfile.id 
      }
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Loyalty program not found'
      });
    }

    // Get or create customer loyalty points record
    let customerPoints = await prisma.customerLoyaltyPoints.findFirst({
      where: {
        loyaltyProgramId: programId,
        userId: validatedData.userId
      }
    });

    if (!customerPoints) {
      customerPoints = await prisma.customerLoyaltyPoints.create({
        data: {
          loyaltyProgramId: programId,
          userId: validatedData.userId,
          points: 0,
          lifetimePoints: 0
        }
      });
    }

    // Calculate new points balance
    let newPoints = customerPoints.points;
    let newLifetimePoints = customerPoints.lifetimePoints;

    if (validatedData.type === 'EARNED' || validatedData.type === 'ADJUSTED') {
      newPoints += validatedData.points;
      if (validatedData.type === 'EARNED') {
        newLifetimePoints += validatedData.points;
      }
    } else if (validatedData.type === 'REDEEMED') {
      newPoints = Math.max(0, newPoints - validatedData.points);
    }

    // Create transaction and update customer points
    const [transaction, updatedCustomerPoints] = await prisma.$transaction([
      prisma.loyaltyTransaction.create({
        data: {
          customerPointsId: customerPoints.id,
          type: validatedData.type,
          points: validatedData.points,
          description: validatedData.description,
          orderId: validatedData.orderId
        }
      }),
      prisma.customerLoyaltyPoints.update({
        where: { id: customerPoints.id },
        data: {
          points: newPoints,
          lifetimePoints: newLifetimePoints,
          lastActivity: new Date()
        },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      })
    ]);

    logger.info({
      vendorProfileId: vendorProfile.id,
      programId: programId,
      userId: validatedData.userId,
      transactionType: validatedData.type,
      points: validatedData.points,
      newBalance: newPoints
    }, 'Added loyalty transaction');

    res.status(201).json({
      success: true,
      data: {
        transaction,
        customerPoints: updatedCustomerPoints
      }
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error adding loyalty transaction');

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

// ================================
// REFERRAL PROGRAM ENDPOINTS
// ================================

// GET /api/vendor/loyalty/referrals - Get all referral programs for vendor
router.get('/referrals', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    
    const referralPrograms = await prisma.referralProgram.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        referrals: {
          include: {
            referrer: {
              select: { id: true, email: true, name: true }
            },
            referee: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            referrals: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields and calculate statistics
    const processedPrograms = referralPrograms.map(program => {
      const referrerReward = JSON.parse(program.referrerReward);
      const refereeReward = JSON.parse(program.refereeReward);
      
      const totalReferrals = program.referrals.length;
      const completedReferrals = program.referrals.filter(r => r.status === 'COMPLETED').length;
      const conversionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals * 100).toFixed(1) : 0;

      return {
        ...program,
        referrerReward,
        refereeReward,
        stats: {
          totalReferrals,
          completedReferrals,
          pendingReferrals: program.referrals.filter(r => r.status === 'PENDING').length,
          conversionRate,
          rewardsClaimed: program.referrals.filter(r => r.rewardsClaimed).length
        }
      };
    });

    logger.info({
      vendorProfileId: vendorProfile.id,
      referralProgramCount: referralPrograms.length
    }, 'Retrieved referral programs for vendor');

    res.json({
      success: true,
      data: processedPrograms
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting referral programs');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/loyalty/referrals - Create new referral program
router.post('/referrals', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = ReferralProgramCreateSchema.parse(req.body);

    const program = await prisma.referralProgram.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        referrerReward: JSON.stringify(validatedData.referrerReward),
        refereeReward: JSON.stringify(validatedData.refereeReward)
      },
      include: {
        referrals: true
      }
    });

    // Parse JSON fields for response
    const processedProgram = {
      ...program,
      referrerReward: JSON.parse(program.referrerReward),
      refereeReward: JSON.parse(program.refereeReward)
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      referralProgramId: program.id,
      programName: program.name
    }, 'Created new referral program');

    res.status(201).json({
      success: true,
      data: processedProgram
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating referral program');

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

// ================================
// CUSTOMER SEGMENT ENDPOINTS
// ================================

// GET /api/vendor/loyalty/segments - Get all customer segments for vendor
router.get('/segments', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    
    const segments = await prisma.customerSegment.findMany({
      where: { vendorProfileId: vendorProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON criteria and add customer count calculations
    const processedSegments = segments.map(segment => ({
      ...segment,
      criteria: JSON.parse(segment.criteria)
    }));

    logger.info({
      vendorProfileId: vendorProfile.id,
      segmentCount: segments.length
    }, 'Retrieved customer segments for vendor');

    res.json({
      success: true,
      data: processedSegments
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error getting customer segments');

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// POST /api/vendor/loyalty/segments - Create new customer segment
router.post('/segments', async (req, res) => {
  try {
    const vendorProfile = await authenticateVendor(req);
    const validatedData = CustomerSegmentCreateSchema.parse(req.body);

    // TODO: Calculate customer count based on criteria
    const customerCount = 0; // Placeholder

    const segment = await prisma.customerSegment.create({
      data: {
        ...validatedData,
        vendorProfileId: vendorProfile.id,
        criteria: JSON.stringify(validatedData.criteria),
        customerCount
      }
    });

    // Parse JSON fields for response
    const processedSegment = {
      ...segment,
      criteria: JSON.parse(segment.criteria)
    };

    logger.info({
      vendorProfileId: vendorProfile.id,
      segmentId: segment.id,
      segmentName: segment.name
    }, 'Created new customer segment');

    res.status(201).json({
      success: true,
      data: processedSegment
    });

  } catch (error: any) {
    logger.error({
      error: error.message,
      stack: error.stack,
      body: req.body
    }, 'Error creating customer segment');

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

export { router as loyaltyRouter };
