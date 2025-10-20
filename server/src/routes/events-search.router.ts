import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();
// Zod schemas for validation
const EventSearchSchema = z.object({
  q: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('20'),
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional().transform(str => str ? str.split(',') : []),
  city: z.string().optional(),
  state: z.string().optional(),
  lat: z.string().transform(Number).optional(),
  lng: z.string().transform(Number).optional(),
  radius: z.string().transform(Number).default('25'),
  sort: z.enum(['relevance', 'date', 'distance', 'popular']).default('relevance'),
});

const EventFacetsSchema = z.object({
  lat: z.string().transform(Number).optional(),
  lng: z.string().transform(Number).optional(),
  radius: z.string().transform(Number).default('25'),
});

const EventCalendarSchema = z.object({
  from: z.string(),
  to: z.string(),
});

const EventMapSchema = z.object({
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  radius: z.string().transform(Number).default('25'),
});

// Helper function to calculate distance score
function calculateDistanceScore(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.max(0, 1 - distance / 100); // Normalize to 0-1, 100mi max
}

// Helper function to calculate time proximity score
function calculateTimeProximityScore(startAt: Date): number {
  const now = new Date();
  const diffMs = startAt.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) return 0; // Past events
  if (diffDays < 7) return 1; // This week
  if (diffDays < 30) return 0.8; // This month
  if (diffDays < 90) return 0.6; // This quarter
  return 0.4; // Future events
}

// GET /api/events/search
router.get('/search', async (req, res) => {
  try {
    const params = EventSearchSchema.parse(req.query);
    
    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    };

    // Text search
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { summary: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q } },
      ];
    }

    // Date range
    if (params.from) {
      where.startAt = { ...where.startAt, gte: new Date(params.from) };
    }
    if (params.to) {
      where.startAt = { ...where.startAt, lte: new Date(params.to) };
    }

    // Category filter
    if (params.category) {
      where.category = params.category;
    }

    // Tags filter
    if (params.tags.length > 0) {
      where.tags = { hasSome: params.tags };
    }

    // Location filter
    if (params.city) {
      where.city = { contains: params.city, mode: 'insensitive' };
    }
    if (params.state) {
      where.state = { contains: params.state, mode: 'insensitive' };
    }

    // Get events
    const events = await (prisma as any).event.findMany({
      where,
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
        _count: {
          select: {
            interests: true,
            favorites: true,
            reviews: true,
          },
        },
      },
      orderBy: params.sort === 'date' ? { startAt: 'asc' } : { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });

    // Calculate scores for relevance/popularity sorting
    const scoredEvents = events.map((event: any) => {
      let score = 0;
      
      if (params.sort === 'relevance') {
        // Text relevance (simplified)
        if (params.q && event.title.toLowerCase().includes(params.q.toLowerCase())) {
          score += 0.5;
        }
        
        // Time proximity
        score += calculateTimeProximityScore(event.startAt) * 0.2;
        
        // Distance (if coordinates provided)
        if (params.lat && params.lng && event.geoPoint) {
          // Note: In a real implementation, you'd decode the PostGIS point
          // For now, we'll use a placeholder
          score += 0.2;
        }
        
        // Popularity (based on interests and favorites)
        const popularity = (event._count.interests + event._count.favorites) / 100;
        score += Math.min(popularity, 0.1);
      } else if (params.sort === 'popular') {
        score = event._count.interests + event._count.favorites + event._count.reviews;
      }
      
      return { ...event, score };
    });

    // Sort by score if relevance or popular
    if (params.sort === 'relevance' || params.sort === 'popular') {
      scoredEvents.sort((a: any, b: any) => b.score - a.score);
    }

    // Calculate total count
    const total = await (prisma as any).event.count({ where });

    return res.json({
      events: scoredEvents,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    });

  } catch (error) {
    console.error('Error searching events:', error);
    return res.status(500).json({ error: 'Failed to search events' });
  }
});

// GET /api/events/facets
router.get('/facets', async (req, res) => {
  try {
    const params = EventFacetsSchema.parse(req.query);
    
    const where: any = {
      status: 'PUBLISHED',
    };

    // Get category counts
    const categories = await (prisma as any).event.groupBy({
      by: ['category'],
      where: { ...where, category: { not: null } },
      _count: { category: true },
    });

    // Get tag counts
    const allEvents = await (prisma as any).event.findMany({
      where,
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    allEvents.forEach((event: any) => {
      event.tags.forEach((tag: any) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Get location counts
    const locations = await (prisma as any).event.groupBy({
      by: ['city', 'state'],
      where: { ...where, city: { not: null } },
      _count: { city: true },
    });

    return res.json({
      categories: categories.map((c: any) => ({
        value: c.category,
        count: c._count.category,
      })),
      tags: Object.entries(tagCounts)
        .map(([tag, count]) => ({ value: tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      locations: locations.map((l: any) => ({
        city: l.city,
        state: l.state,
        count: l._count.city,
      })),
    });

  } catch (error) {
    console.error('Error fetching event facets:', error);
    return res.status(500).json({ error: 'Failed to fetch event facets' });
  }
});

// GET /api/events/calendar
router.get('/calendar', async (req, res) => {
  try {
    const params = EventCalendarSchema.parse(req.query);
    
    const events = await (prisma as any).event.findMany({
      where: {
        status: 'PUBLISHED',
        startAt: {
          gte: new Date(params.from),
          lte: new Date(params.to),
        },
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        category: true,
        city: true,
        state: true,
        minStallPrice: true,
        _count: {
          select: {
            stalls: true,
            vendors: true,
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    return res.json({ events });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET /api/events/map
router.get('/map', async (req, res) => {
  try {
    const params = EventMapSchema.parse(req.query);
    
    const events = await (prisma as any).event.findMany({
      where: {
        status: 'PUBLISHED',
        geoPoint: { not: null },
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        city: true,
        state: true,
        geoPoint: true,
        minStallPrice: true,
      },
      take: 100, // Limit for performance
    });

    // Note: In a real implementation, you'd use PostGIS ST_DWithin for spatial filtering
    // For now, we'll return all events with coordinates
    const mapPins = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      startAt: event.startAt,
      city: event.city,
      state: event.state,
      // Note: You'd decode the PostGIS point to get lat/lng
      lat: 0, // Placeholder
      lng: 0, // Placeholder
      minStallPrice: event.minStallPrice,
    }));

    return res.json({ pins: mapPins });

  } catch (error) {
    console.error('Error fetching map events:', error);
    return res.status(500).json({ error: 'Failed to fetch map events' });
  }
});

export default router;
