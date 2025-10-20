import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/session-simple';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Validation schema
const trackSearchSchema = z.object({
  query: z.string().optional(),
  params: z.object({
    q: z.string().optional(),
    categories: z.array(z.string()).optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    tags: z.array(z.string()).optional(),
    fulfillment: z.array(z.string()).optional(),
    vendorsOnly: z.boolean().optional(),
    favoritesOnly: z.boolean().optional(),
    openNow: z.boolean().optional(),
    sort: z.string().optional(),
    national: z.boolean().optional(),
    myVendors: z.boolean().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    radius: z.number().optional(),
  }).optional(),
  results: z.number().min(0),
  tookMs: z.number().min(0),
});

// Track search event
router.post('/search', async (req, res) => {
  try {
    const userId = req.user?.id; // Optional - can track anonymous searches
    const data = trackSearchSchema.parse(req.body);

    const searchEvent = await prisma.searchEvent.create({
      data: {
        userId,
        query: data.query,
        params: data.params as any,
        results: data.results,
        tookMs: data.tookMs,
      },
    });

    res.status(201).json({
      id: searchEvent.id,
      message: 'Search event tracked successfully',
    });

  } catch (error) {
    console.error('Track search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tracking data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to track search event' });
  }
});

// Get search analytics (admin only - for now, just return basic stats)
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    const [
      totalSearches,
      uniqueUsers,
      avgResults,
      avgResponseTime,
      topQueries,
      searchTrends,
    ] = await Promise.all([
      // Total searches
      prisma.searchEvent.count({
        where: {
          createdAt: { gte: daysAgo },
        },
      }),

      // Unique users
      prisma.searchEvent.findMany({
        where: {
          createdAt: { gte: daysAgo },
          userId: { not: null },
        },
        select: { userId: true },
        distinct: ['userId'],
      }).then(events => events.length),

      // Average results
      prisma.searchEvent.aggregate({
        where: {
          createdAt: { gte: daysAgo },
        },
        _avg: { results: true },
      }),

      // Average response time
      prisma.searchEvent.aggregate({
        where: {
          createdAt: { gte: daysAgo },
        },
        _avg: { tookMs: true },
      }),

      // Top queries
      prisma.searchEvent.groupBy({
        by: ['query'],
        where: {
          createdAt: { gte: daysAgo },
          query: { not: null },
        },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),

      // Search trends by day
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM "SearchEvent"
        WHERE created_at >= ${daysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    res.json({
      period: {
        days: Number(days),
        startDate: daysAgo,
        endDate: new Date(),
      },
      stats: {
        totalSearches,
        uniqueUsers,
        avgResults: Math.round(avgResults._avg.results || 0),
        avgResponseTime: Math.round(avgResponseTime._avg.tookMs || 0),
      },
      topQueries: topQueries.map(q => ({
        query: q.query,
        count: q._count.query,
      })),
      trends: searchTrends.map(t => ({
        date: t.date,
        count: Number(t.count),
      })),
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get search analytics' });
  }
});

// Get user's search history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, pageSize = 20 } = req.query;

    const searchEvents = await prisma.searchEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    const total = await prisma.searchEvent.count({
      where: { userId },
    });

    res.json({
      searches: searchEvents.map(event => ({
        id: event.id,
        query: event.query,
        params: event.params,
        results: event.results,
        tookMs: event.tookMs,
        createdAt: event.createdAt,
      })),
      meta: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });

  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

export default router;
