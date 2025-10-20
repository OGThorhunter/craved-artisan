import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();
// Middleware to check if user is coordinator
const isCoordinator = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has a vendor profile (coordinator)
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendorProfile) {
      return res.status(403).json({ error: 'Coordinator access required' });
    }

    (req as any).coordinatorId = vendorProfile.id;
    next();
  } catch (error) {
    console.error('Error checking coordinator access:', error);
    return res.status(500).json({ error: 'Failed to verify coordinator access' });
  }
};

// GET /api/events/coordinator - Get coordinator's events
router.get('/coordinator', isCoordinator, async (req, res) => {
  try {
    const coordinatorId = (req as any).coordinatorId;
    
    const events = await (prisma as any).event.findMany({
      where: { coordinatorId },
      include: {
        stalls: {
          select: {
            id: true,
            name: true,
            price: true,
            qtyTotal: true,
            qtySold: true,
          },
        },
        vendors: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                imageUrl: true,
              },
            },
            stall: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        _count: {
          select: {
            interests: true,
            favorites: true,
            reviews: true,
            vendors: true,
            stalls: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(events);

  } catch (error) {
    console.error('Error fetching coordinator events:', error);
    return res.status(500).json({ error: 'Failed to fetch coordinator events' });
  }
});

// GET /api/events/applications - Get vendor applications for coordinator's events
router.get('/applications', isCoordinator, async (req, res) => {
  try {
    const coordinatorId = (req as any).coordinatorId;
    
    // Get all events by this coordinator
    const events = await (prisma as any).event.findMany({
      where: { coordinatorId },
      select: { id: true },
    });

    const eventIds = events.map((e: any) => e.id);

    const applications = await (prisma as any).eventVendor.findMany({
      where: {
        eventId: { in: eventIds },
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            imageUrl: true,
            city: true,
            state: true,
            ratingAvg: true,
            ratingCount: true,
          },
        },
        stall: {
          select: {
            name: true,
            price: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(applications);

  } catch (error) {
    console.error('Error fetching vendor applications:', error);
    return res.status(500).json({ error: 'Failed to fetch vendor applications' });
  }
});

// PUT /api/events/applications/:id/status - Update vendor application status
router.put('/applications/:id/status', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const coordinatorId = (req as any).coordinatorId;

    // Check if application exists and belongs to coordinator's event
    const application = await (prisma as any).eventVendor.findUnique({
      where: { id },
      include: {
        event: {
          select: { coordinatorId: true, title: true },
        },
        vendor: {
          select: { id: true, storeName: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.event.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update application status
    const updatedApplication = await (prisma as any).eventVendor.update({
      where: { id },
      data: {
        status,
        message,
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            imageUrl: true,
            city: true,
            state: true,
            ratingAvg: true,
            ratingCount: true,
          },
        },
        stall: {
          select: {
            name: true,
            price: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Create system message for vendor
    await (prisma as any).systemMessage.create({
      data: {
        vendorProfileId: application.vendor.id,
        scope: 'events',
        type: 'vendor_status_update',
        title: `Application update for ${application.event.title}`,
        body: `Your application status has been updated to ${status}. ${message ? `Message: ${message}` : ''}`,
        data: JSON.stringify({
          eventId: application.event.id,
          status,
          message,
        }),
      },
    });

    return res.json(updatedApplication);

  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = (req as any).coordinatorId;

    // Check if event exists and user owns it
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { coordinatorId: true, title: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete event (cascade will handle related records)
    await (prisma as any).event.delete({
      where: { id },
    });

    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/unpublish - Unpublish event
router.post('/:id/unpublish', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = (req as any).coordinatorId;

    // Check if event exists and user owns it
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { coordinatorId: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status to draft
    const updatedEvent = await (prisma as any).event.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    return res.json(updatedEvent);

  } catch (error) {
    console.error('Error unpublishing event:', error);
    return res.status(500).json({ error: 'Failed to unpublish event' });
  }
});

export default router;
