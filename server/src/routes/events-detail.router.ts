import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();
// Zod schemas for validation
const EventInterestSchema = z.object({
  status: z.enum(['INTERESTED', 'GOING']),
  email: z.string().email().optional(),
});

const EventReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  body: z.string().optional(),
});

const EventQuestionSchema = z.object({
  message: z.string().min(10),
});

// GET /api/events/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const event = await (prisma as any).event.findUnique({
      where: { slug },
      include: {
        stalls: {
          orderBy: { sort: 'asc' },
        },
        vendors: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                imageUrl: true,
                slug: true,
                city: true,
                state: true,
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
        perks: true,
        faqs: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            interests: true,
            favorites: true,
            reviews: true,
            vendors: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate average rating
    const avgRating = event.reviews.length > 0 
      ? event.reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / event.reviews.length
      : 0;

    return res.json({
      ...event,
      avgRating: Math.round(avgRating * 10) / 10,
    });

  } catch (error) {
    console.error('Error fetching event detail:', error);
    return res.status(500).json({ error: 'Failed to fetch event detail' });
  }
});

// POST /api/events/:id/interest
router.post('/:id/interest', async (req, res) => {
  try {
    const { id } = req.params;
    const data = EventInterestSchema.parse(req.body);
    const userId = (req as any).user?.id;

    // Check if event exists
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { id: true, title: true, coordinatorId: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create or update interest
    const interest = await (prisma as any).eventInterest.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId: userId || '',
        },
      },
      update: {
        status: data.status,
      },
      create: {
        eventId: id,
        userId: userId || null,
        emailHash: data.email ? Buffer.from(data.email).toString('base64') : null,
        status: data.status,
      },
    });

    // Create system message for coordinator
    if (userId) {
      await (prisma as any).systemMessage.create({
        data: {
          vendorProfileId: event.coordinatorId,
          scope: 'events',
          type: 'event_interest',
          title: `New interest in ${event.title}`,
          body: `A user has marked themselves as ${data.status.toLowerCase()} for your event.`,
          data: JSON.stringify({
            eventId: id,
            userId,
            status: data.status,
          }),
        },
      });
    }

    return res.json({ success: true, interest });

  } catch (error) {
    console.error('Error creating event interest:', error);
    return res.status(500).json({ error: 'Failed to create event interest' });
  }
});

// POST /api/events/:id/favorite
router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if already favorited
    const existing = await (prisma as any).eventFavorite.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await (prisma as any).eventFavorite.delete({
        where: {
          userId_eventId: {
            userId,
            eventId: id,
          },
        },
      });
      return res.json({ favorited: false });
    } else {
      // Add favorite
      await (prisma as any).eventFavorite.create({
        data: {
          userId,
          eventId: id,
        },
      });
      return res.json({ favorited: true });
    }

  } catch (error) {
    console.error('Error toggling event favorite:', error);
    return res.status(500).json({ error: 'Failed to toggle event favorite' });
  }
});

// POST /api/events/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const data = EventReviewSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if event exists
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { id: true, title: true, coordinatorId: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user already reviewed
    const existingReview = await (prisma as any).eventReview.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this event' });
    }

    // Create review
    const review = await (prisma as any).eventReview.create({
      data: {
        eventId: id,
        userId,
        rating: data.rating,
        body: data.body,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create system message for coordinator
    await (prisma as any).systemMessage.create({
      data: {
        vendorProfileId: event.coordinatorId,
        scope: 'events',
        type: 'event_review',
        title: `New review for ${event.title}`,
        body: `A user left a ${data.rating}-star review for your event.`,
        data: JSON.stringify({
          eventId: id,
          reviewId: review.id,
          rating: data.rating,
        }),
      },
    });

    return res.json({ success: true, review });

  } catch (error) {
    console.error('Error creating event review:', error);
    return res.status(500).json({ error: 'Failed to create event review' });
  }
});

// GET /api/events/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const reviews = await (prisma as any).eventReview.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await (prisma as any).eventReview.count({
      where: { eventId: id },
    });

    return res.json({
      reviews,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });

  } catch (error) {
    console.error('Error fetching event reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch event reviews' });
  }
});

// POST /api/events/:id/question
router.post('/:id/question', async (req, res) => {
  try {
    const { id } = req.params;
    const data = EventQuestionSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if event exists
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: { id: true, title: true, coordinatorId: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Create system message for coordinator
    const message = await (prisma as any).systemMessage.create({
      data: {
        vendorProfileId: event.coordinatorId,
        scope: 'events',
        type: 'question',
        title: `Question about ${event.title}`,
        body: `${user?.name || 'A user'} asked: ${data.message}`,
        data: JSON.stringify({
          eventId: id,
          userId,
          question: data.message,
        }),
      },
    });

    return res.json({ success: true, messageId: message.id });

  } catch (error) {
    console.error('Error creating event question:', error);
    return res.status(500).json({ error: 'Failed to create event question' });
  }
});

// GET /api/events/:id/share-meta
router.get('/:id/share-meta', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        summary: true,
        startAt: true,
        city: true,
        state: true,
        imageUrl: true,
        slug: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const shareText = `Check out "${event.title}" on ${event.startAt.toLocaleDateString()} in ${event.city}, ${event.state}. ${event.summary || ''}`;
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event.slug}`;

    return res.json({
      title: event.title,
      description: event.summary,
      image: event.imageUrl,
      url: shareUrl,
      shareText,
    });

  } catch (error) {
    console.error('Error fetching event share meta:', error);
    return res.status(500).json({ error: 'Failed to fetch event share meta' });
  }
});

// GET /api/events/:id/ical
router.get('/:id/ical', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await (prisma as any).event.findUnique({
      where: { id },
      select: {
        title: true,
        summary: true,
        startAt: true,
        endAt: true,
        addressText: true,
        city: true,
        state: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate iCal content
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Craved Artisan//Event Calendar//EN
BEGIN:VEVENT
UID:${id}@craved-artisan.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.startAt.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.endAt.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.summary || ''}
LOCATION:${event.addressText || `${event.city}, ${event.state}`}
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
    return res.send(icalContent);

  } catch (error) {
    console.error('Error generating iCal:', error);
    return res.status(500).json({ error: 'Failed to generate iCal' });
  }
});

export default router;
