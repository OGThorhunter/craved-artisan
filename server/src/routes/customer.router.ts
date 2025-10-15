import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/customer/profile
 * Get customer profile information
 */
router.get('/profile', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    logger.info({ userId }, 'Fetching customer profile');

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phoneNumber: true,
        createdAt: true,
        // Add any other customer-specific fields here
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      customer: {
        id: user.id,
        name: user.name || 'Customer',
        email: user.email,
        avatar: user.avatar || '/images/avatars/default.jpg',
        phoneNumber: user.phoneNumber,
        joinDate: user.createdAt.toISOString(),
        // Mock data for now - these fields need to be added to the schema
        primaryZip: '30248',
        secondaryZips: [],
        referralCode: user.id.slice(0, 8).toUpperCase(),
        referralCount: 0,
        address: null,
        phoneLandline: null,
        phoneMobile: user.phoneNumber,
        smsOptIn: false,
        avatarType: 'default' as const,
        socialConnections: {
          google: { connected: false, shareProducts: false, shareDeals: false },
          facebook: { connected: false, shareProducts: false, shareDeals: false },
          instagram: { connected: false, shareProducts: false, shareDeals: false },
          x: { connected: false, shareProducts: false, shareDeals: false },
          youtube: { connected: false, shareProducts: false, shareDeals: false },
          pinterest: { connected: false, shareProducts: false, shareDeals: false },
          whatsapp: { connected: false, shareProducts: false, shareDeals: false },
          nextdoor: { connected: false, shareProducts: false, shareDeals: false },
          linkedin: { connected: false, shareProducts: false, shareDeals: false }
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          marketing: true,
          defaultPickupMethod: 'pickup' as const
        }
      }
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching customer profile');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/customer/profile
 * Update customer profile
 */
router.put('/profile', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    const updates = req.body;

    logger.info({ userId, updates }, 'Updating customer profile');

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updates.name,
        phoneNumber: updates.phoneNumber,
        avatar: updates.avatar
        // Add other updatable fields
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        phoneNumber: updatedUser.phoneNumber
      }
    });

  } catch (error) {
    logger.error({ error }, 'Error updating customer profile');
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/customer/favorites
 * Get customer's favorite vendors
 */
router.get('/favorites', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    logger.info({ userId }, 'Fetching favorite vendors');

    // For now, return empty array - this needs favorites table in schema
    // In production, query a Favorites table
    const favorites: any[] = [];

    res.json({
      success: true,
      favorites
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching favorites');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

/**
 * POST /api/customer/favorites/:vendorId
 * Add vendor to favorites
 */
router.post('/favorites/:vendorId', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    const vendorId = req.params.vendorId;

    logger.info({ userId, vendorId }, 'Adding vendor to favorites');

    // In production, insert into Favorites table
    // For now, just return success
    res.json({
      success: true,
      message: 'Vendor added to favorites'
    });

  } catch (error) {
    logger.error({ error }, 'Error adding favorite');
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite'
    });
  }
});

/**
 * DELETE /api/customer/favorites/:vendorId
 * Remove vendor from favorites
 */
router.delete('/favorites/:vendorId', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    const vendorId = req.params.vendorId;

    logger.info({ userId, vendorId }, 'Removing vendor from favorites');

    // In production, delete from Favorites table
    res.json({
      success: true,
      message: 'Vendor removed from favorites'
    });

  } catch (error) {
    logger.error({ error }, 'Error removing favorite');
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite'
    });
  }
});

/**
 * GET /api/customer/messages
 * Get customer messages
 */
router.get('/messages', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    logger.info({ userId }, 'Fetching customer messages');

    // For now, return empty array - this needs messages table in schema
    const messages: any[] = [];

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching messages');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

/**
 * GET /api/customer/events
 * Get upcoming events for customer
 */
router.get('/events', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const userId = req.session.user.userId;
    logger.info({ userId }, 'Fetching customer events');

    // Fetch upcoming events from the database
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDate: {
          gte: new Date() // Only future events
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        venue: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        maxCapacity: true,
        categories: true
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 10 // Limit to next 10 events
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.title,
      date: event.startDate.toISOString().split('T')[0],
      time: event.startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: event.venue,
      image: event.coverImage || '/images/events/default.jpg',
      type: (event.categories && event.categories[0]) || 'market',
      description: event.description || '',
      organizer: 'Craved Artisan',
      capacity: event.maxCapacity,
      registeredCount: 0, // TODO: Count from registrations table
      rsvpStatus: 'not-going' as const, // TODO: Check user's RSVP
      favoriteVendorsAttending: []
    }));

    res.json({
      success: true,
      events: formattedEvents
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching customer events');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

export default router;

