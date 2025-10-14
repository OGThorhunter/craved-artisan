import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check if user is coordinator
const isCoordinator = async (req: any, res: any, next: any) => {
  try {
    const userId = (req as any).user?.id;
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

// Zod schemas for validation
const EventCreateSchema = z.object({
  title: z.string().min(3),
  summary: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  startAt: z.string(),
  endAt: z.string(),
  addressText: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().default('America/New_York'),
  imageUrl: z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

const EventUpdateSchema = EventCreateSchema.partial();

const StallCreateSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qtyTotal: z.number().int().positive(),
  perks: z.array(z.string()).default([]),
  notes: z.string().optional(),
  sort: z.number().int().default(0),
});

const VendorApplicationSchema = z.object({
  stallId: z.string().optional(),
  message: z.string().optional(),
});

const VendorStatusUpdateSchema = z.object({
  status: z.enum(['APPLIED', 'APPROVED', 'PAID', 'WAITLIST', 'CANCELLED']),
  message: z.string().optional(),
});

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// POST /api/events
router.post('/', isCoordinator, async (req, res) => {
  try {
    const data = EventCreateSchema.parse(req.body);
    const coordinatorId = (req as any).coordinatorId;

    // Generate unique slug
    let slug = generateSlug(data.title);
    let counter = 1;
    while (await (prisma as any).event.findUnique({ where: { slug } })) {
      slug = `${generateSlug(data.title)}-${counter}`;
      counter++;
    }

    // Create event
    const event = await (prisma as any).event.create({
      data: {
        coordinatorId,
        title: data.title,
        slug,
        summary: data.summary,
        description: data.description,
        category: data.category,
        tags: data.tags,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        addressText: data.addressText,
        // Note: In a real implementation, you'd encode lat/lng to PostGIS POINT
        // geoPoint: data.lat && data.lng ? encodePostGISPoint(data.lat, data.lng) : null,
        city: data.city,
        state: data.state,
        country: data.country,
        timezone: data.timezone,
        imageUrl: data.imageUrl,
        capacity: data.capacity,
        socialLinks: data.socialLinks,
        status: 'DRAFT',
      },
    });

    return res.status(201).json(event);

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id
router.put('/:id', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const data = EventUpdateSchema.parse(req.body);
    const coordinatorId = (req as any).coordinatorId;

    // Check if event exists and user owns it
    const existingEvent = await (prisma as any).event.findUnique({
      where: { id },
      select: { coordinatorId: true, title: true },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update slug if title changed
    const updateData: any = { ...data };
    if (data.title && data.title !== existingEvent.title) {
      let slug = generateSlug(data.title);
      let counter = 1;
      while (await (prisma as any).event.findUnique({ where: { slug } })) {
        slug = `${generateSlug(data.title)}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    // Convert date strings to Date objects
    if (data.startAt) updateData.startAt = new Date(data.startAt);
    if (data.endAt) updateData.endAt = new Date(data.endAt);

    const event = await (prisma as any).event.update({
      where: { id },
      data: updateData,
    });

    return res.json(event);

  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

// POST /api/events/:id/publish
router.post('/:id/publish', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = (req as any).coordinatorId;

    // Check if event exists and user owns it
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { coordinatorId: true, status: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status to published
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return res.json(updatedEvent);

  } catch (error) {
    console.error('Error publishing event:', error);
    return res.status(500).json({ error: 'Failed to publish event' });
  }
});

// POST /api/events/:id/cancel
router.post('/:id/cancel', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = (req as any).coordinatorId;

    // Check if event exists and user owns it
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { coordinatorId: true, status: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.coordinatorId !== coordinatorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status to cancelled
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Create system messages for interested users
    const interests = await (prisma as any).eventInterest.findMany({
      where: { eventId: id },
      select: { userId: true },
    });

    for (const interest of interests) {
      if (interest.userId) {
        await (prisma as any).systemMessage.create({
          data: {
            vendorProfileId: coordinatorId,
            scope: 'events',
            type: 'event_update',
            title: 'Event Cancelled',
            body: 'An event you were interested in has been cancelled.',
            data: JSON.stringify({
              eventId: id,
              type: 'cancelled',
            }),
          },
        });
      }
    }

    return res.json(updatedEvent);

  } catch (error) {
    console.error('Error cancelling event:', error);
    return res.status(500).json({ error: 'Failed to cancel event' });
  }
});

// POST /api/events/:id/stalls
router.post('/:id/stalls', isCoordinator, async (req, res) => {
  try {
    const { id } = req.params;
    const data = StallCreateSchema.parse(req.body);
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

    // Create stall
    const stall = await (prisma as any).eventStall.create({
      data: {
        eventId: id,
        name: data.name,
        price: data.price,
        qtyTotal: data.qtyTotal,
        perks: data.perks,
        notes: data.notes,
        sort: data.sort,
      },
    });

    // Update event's minStallPrice if this is the first stall or cheaper
    const eventStalls = await (prisma as any).eventStall.findMany({
      where: { eventId: id },
      select: { price: true },
    });

    const minPrice = Math.min(...eventStalls.map((s: any) => Number(s.price)));
    await (prisma as any).event.update({
      where: { id },
      data: { minStallPrice: minPrice },
    });

    return res.status(201).json(stall);

  } catch (error) {
    console.error('Error creating stall:', error);
    return res.status(500).json({ error: 'Failed to create stall' });
  }
});

// POST /api/events/:id/vendors/apply
router.post('/:id/vendors/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const data = VendorApplicationSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!vendorProfile) {
      return res.status(403).json({ error: 'Vendor profile required' });
    }

    // Check if event exists
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { id: true, title: true, coordinatorId: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already applied
    const existingApplication = await (prisma as any).eventVendor.findUnique({
      where: {
        eventId_vendorId: {
          eventId: id,
          vendorId: vendorProfile.id,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this event' });
    }

    // Create application
    const application = await (prisma as any).eventVendor.create({
      data: {
        eventId: id,
        vendorId: vendorProfile.id,
        stallId: data.stallId,
        message: data.message,
        status: 'APPLIED',
      },
    });

    // Create system message for coordinator
    await (prisma as any).systemMessage.create({
      data: {
        vendorProfileId: event.coordinatorId,
        scope: 'events',
        type: 'vendor_application',
        title: `New vendor application for ${event.title}`,
        body: `A vendor has applied to participate in your event.`,
        data: JSON.stringify({
          eventId: id,
          vendorId: vendorProfile.id,
          applicationId: application.id,
        }),
      },
    });

    return res.status(201).json(application);

  } catch (error) {
    console.error('Error creating vendor application:', error);
    return res.status(500).json({ error: 'Failed to create vendor application' });
  }
});

// PUT /api/events/:id/vendors/:rowId/status
router.put('/:id/vendors/:rowId/status', isCoordinator, async (req, res) => {
  try {
    const { id, rowId } = req.params;
    const data = VendorStatusUpdateSchema.parse(req.body);
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

    // Update vendor status
    const vendorApplication = await (prisma as any).eventVendor.update({
      where: { id: rowId },
      data: {
        status: data.status,
        message: data.message,
      },
      include: {
        vendor: {
          select: {
            id: true,
            storeName: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Create system message for vendor
    await (prisma as any).systemMessage.create({
      data: {
        vendorProfileId: vendorApplication.vendorId,
        scope: 'events',
        type: 'vendor_status_update',
        title: `Application update for ${event.title}`,
        body: `Your application status has been updated to ${data.status}.`,
        data: JSON.stringify({
          eventId: id,
          status: data.status,
          message: data.message,
        }),
      },
    });

    return res.json(vendorApplication);

  } catch (error) {
    console.error('Error updating vendor status:', error);
    return res.status(500).json({ error: 'Failed to update vendor status' });
  }
});

export default router;
