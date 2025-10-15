import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../logger';
import { requireAuth } from '../middleware/session-simple';
import { slugSchema, urlSchema, phoneSchema, generateSlug } from '../utils/validation';
import type { Request, Response } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createCoordinatorProfileSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  bio: z.string().optional(),
  phone: phoneSchema,
  website: urlSchema,
  socialLinks: z.string().optional(), // JSON string
  slug: slugSchema.optional()
});

const updateCoordinatorProfileSchema = z.object({
  organizationName: z.string().min(2).optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url().optional(),
  phone: phoneSchema,
  website: urlSchema,
  socialLinks: z.string().optional()
});

/**
 * GET /api/coordinator/profile
 * Get current coordinator's profile
 */
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;

    const profile = await prisma.eventCoordinatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            emailVerified: true,
            created_at: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found'
      });
    }

    logger.info({ userId, profileId: profile.id }, 'Retrieved coordinator profile');

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching coordinator profile');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coordinator profile'
    });
  }
});

/**
 * POST /api/coordinator/profile
 * Create coordinator profile
 */
router.post('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;

    // Check if profile already exists
    const existingProfile = await prisma.eventCoordinatorProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Coordinator profile already exists'
      });
    }

    // Validate request body
    const validation = createCoordinatorProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const data = validation.data;

    // Generate slug if not provided
    let slug = data.slug || generateSlug(data.organizationName);

    // Ensure slug is unique
    let slugExists = await prisma.eventCoordinatorProfile.findUnique({
      where: { slug }
    });
    
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(data.organizationName)}-${counter}`;
      slugExists = await prisma.eventCoordinatorProfile.findUnique({
        where: { slug }
      });
      counter++;
    }

    // Create profile
    const profile = await prisma.eventCoordinatorProfile.create({
      data: {
        userId,
        organizationName: data.organizationName,
        bio: data.bio,
        slug,
        phone: data.phone,
        website: data.website,
        socialLinks: data.socialLinks
      }
    });

    logger.info({ userId, profileId: profile.id, slug }, 'Created coordinator profile');

    res.json({
      success: true,
      message: 'Coordinator profile created successfully',
      profile
    });
  } catch (error) {
    logger.error({ error }, 'Error creating coordinator profile');
    res.status(500).json({
      success: false,
      message: 'Failed to create coordinator profile'
    });
  }
});

/**
 * PUT /api/coordinator/profile
 * Update coordinator profile
 */
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;

    // Validate request body
    const validation = updateCoordinatorProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const data = validation.data;

    // Update profile
    const profile = await prisma.eventCoordinatorProfile.update({
      where: { userId },
      data: {
        ...(data.organizationName && { organizationName: data.organizationName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks })
      }
    });

    logger.info({ userId, profileId: profile.id }, 'Updated coordinator profile');

    res.json({
      success: true,
      message: 'Coordinator profile updated successfully',
      profile
    });
  } catch (error) {
    logger.error({ error }, 'Error updating coordinator profile');
    res.status(500).json({
      success: false,
      message: 'Failed to update coordinator profile'
    });
  }
});

/**
 * POST /api/coordinator/stripe/onboard
 * Create Stripe Connect account for coordinator
 */
router.post('/stripe/onboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;

    const profile = await prisma.eventCoordinatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found'
      });
    }

    // Check if already has Stripe account
    if (profile.stripeAccountId && profile.stripeAccountStatus === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Stripe account already connected'
      });
    }

    // TODO: Integrate with actual Stripe Connect API
    // For now, return mock response
    const mockStripeAccountId = `acct_${Date.now()}`;
    const mockOnboardingUrl = `https://connect.stripe.com/express/onboarding/${mockStripeAccountId}`;

    await prisma.eventCoordinatorProfile.update({
      where: { userId },
      data: {
        stripeAccountId: mockStripeAccountId,
        stripeAccountStatus: 'pending',
        stripeOnboardingUrl: mockOnboardingUrl
      }
    });

    logger.info(
      { userId, stripeAccountId: mockStripeAccountId },
      'Created Stripe Connect account for coordinator'
    );

    res.json({
      success: true,
      message: 'Stripe onboarding initiated',
      onboardingUrl: mockOnboardingUrl,
      stripeAccountId: mockStripeAccountId
    });
  } catch (error) {
    logger.error({ error }, 'Error creating Stripe Connect account');
    res.status(500).json({
      success: false,
      message: 'Failed to create Stripe Connect account'
    });
  }
});

/**
 * GET /api/coordinator/stripe/status
 * Check Stripe onboarding status
 */
router.get('/stripe/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;

    const profile = await prisma.eventCoordinatorProfile.findUnique({
      where: { userId },
      select: {
        stripeAccountId: true,
        stripeAccountStatus: true,
        stripeOnboardingUrl: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator profile not found'
      });
    }

    // TODO: Check actual Stripe account status via API
    // For now, return stored status
    const status = profile.stripeAccountStatus || 'not_started';
    const isComplete = status === 'active';
    const needsOnboarding = !isComplete && profile.stripeAccountId;

    res.json({
      success: true,
      stripeStatus: {
        status,
        isComplete,
        needsOnboarding,
        accountId: profile.stripeAccountId,
        onboardingUrl: needsOnboarding ? profile.stripeOnboardingUrl : null
      }
    });
  } catch (error) {
    logger.error({ error }, 'Error checking Stripe status');
    res.status(500).json({
      success: false,
      message: 'Failed to check Stripe status'
    });
  }
});

/**
 * GET /api/coordinator/:slug
 * Get coordinator profile by slug (public)
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const profile = await prisma.eventCoordinatorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        },
        events: {
          where: {
            status: 'PUBLISHED',
            startAt: {
              gte: new Date()
            }
          },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            imageUrl: true,
            startAt: true,
            endAt: true,
            city: true,
            state: true
          },
          orderBy: {
            startAt: 'asc'
          },
          take: 10
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Coordinator not found'
      });
    }

    logger.info({ slug, profileId: profile.id }, 'Retrieved public coordinator profile');

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error({ error, slug: req.params.slug }, 'Error fetching public coordinator profile');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coordinator profile'
    });
  }
});

export default router;

