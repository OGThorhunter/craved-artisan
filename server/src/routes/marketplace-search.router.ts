import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/isAuthenticated-mock';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const searchQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(24),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(500).default(25), // miles
  categories: z.string().optional().transform(val => val ? val.split(',') : []),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : []),
  fulfillment: z.string().optional().transform(val => val ? val.split(',') : []),
  vendorsOnly: z.coerce.boolean().default(false),
  favoritesOnly: z.coerce.boolean().default(false),
  openNow: z.coerce.boolean().default(false),
  sort: z.enum(['relevance', 'distance', 'price_asc', 'price_desc', 'newest', 'popular', 'rating']).default('relevance'),
  national: z.coerce.boolean().default(false),
  myVendors: z.coerce.boolean().default(false),
});

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const params = searchQuerySchema.parse(req.query);
    const userId = req.user?.id;
    
    const startTime = Date.now();
    
    // Build base query
    let whereClause: any = {
      active: true,
      availableNow: params.openNow ? true : undefined,
    };

    // Text search
    if (params.q) {
      whereClause.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q } },
      ];
    }

    // Category filter
    if (params.categories.length > 0) {
      whereClause.type = { in: params.categories };
    }

    // Price range
    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      whereClause.price = {};
      if (params.priceMin !== undefined) whereClause.price.gte = params.priceMin;
      if (params.priceMax !== undefined) whereClause.price.lte = params.priceMax;
    }

    // Tags filter
    if (params.tags.length > 0) {
      whereClause.tags = { hasSome: params.tags };
    }

    // Fulfillment filter
    if (params.fulfillment.length > 0) {
      const fulfillmentConditions = [];
      if (params.fulfillment.includes('pickup')) fulfillmentConditions.push({ pickup: true });
      if (params.fulfillment.includes('delivery')) fulfillmentConditions.push({ delivery: true });
      if (params.fulfillment.includes('ship')) fulfillmentConditions.push({ ship: true });
      
      if (fulfillmentConditions.length > 0) {
        whereClause.OR = whereClause.OR ? [...whereClause.OR, ...fulfillmentConditions] : fulfillmentConditions;
      }
    }

    // Vendor filters
    if (params.vendorsOnly || params.myVendors) {
      const favoriteVendorIds = userId ? await prisma.favoriteVendor.findMany({
        where: { userId },
        select: { vendorId: true },
      }).then(favs => favs.map(f => f.vendorId)) : [];
      
      if (params.myVendors && favoriteVendorIds.length > 0) {
        whereClause.vendorProfileId = { in: favoriteVendorIds };
      }
    }

    // Favorites filter
    if (params.favoritesOnly && userId) {
      const favoriteProductIds = await prisma.favoriteProduct.findMany({
        where: { userId },
        select: { productId: true },
      }).then(favs => favs.map(f => f.productId));
      
      if (favoriteProductIds.length > 0) {
        whereClause.id = { in: favoriteProductIds };
      } else {
        // No favorites, return empty results
        return res.json({
          products: [],
          facets: {},
          meta: {
            total: 0,
            page: params.page,
            pageSize: params.pageSize,
            totalPages: 0,
            tookMs: Date.now() - startTime,
            expandedRadius: false,
          },
        });
      }
    }

    // Proximity search (if location provided and not national)
    let proximityVendorIds: string[] = [];
    if (!params.national && params.lat && params.lng) {
      // Convert miles to meters
      const radiusMeters = params.radius * 1609.34;
      
      // Find vendors within radius
      const nearbyVendors = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "VendorProfile" 
        WHERE "baseLocation" IS NOT NULL 
        AND ST_DWithin("baseLocation", ST_MakePoint(${params.lng}, ${params.lat}), ${radiusMeters})
      `;
      
      proximityVendorIds = nearbyVendors.map(v => v.id);
      
      // If no vendors found nearby, expand radius
      if (proximityVendorIds.length === 0) {
        const expandedRadiusMeters = (params.radius * 2) * 1609.34;
        const expandedVendors = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "VendorProfile" 
          WHERE "baseLocation" IS NOT NULL 
          AND ST_DWithin("baseLocation", ST_MakePoint(${params.lng}, ${params.lat}), ${expandedRadiusMeters})
        `;
        proximityVendorIds = expandedVendors.map(v => v.id);
      }
      
      // Filter by proximity if we have results
      if (proximityVendorIds.length > 0) {
        whereClause.vendorProfileId = { in: proximityVendorIds };
      }
    }

    // Build sort order
    let orderBy: any = {};
    switch (params.sort) {
      case 'distance':
        // Note: This would require a more complex query with distance calculation
        orderBy = { createdAt: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { ratingCount: 'desc' };
        break;
      case 'rating':
        orderBy = { ratingAvg: 'desc' };
        break;
      default: // relevance
        orderBy = { ratingAvg: 'desc' };
    }

    // Execute search
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              slug: true,
              avatarUrl: true,
              city: true,
              state: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
          favoriteProducts: userId ? {
            where: { userId },
            select: { id: true },
          } : false,
        },
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Calculate facets
    const facets = await calculateFacets(whereClause, params);

    const tookMs = Date.now() - startTime;

    // Log search event
    if (userId) {
      await prisma.searchEvent.create({
        data: {
          userId,
          query: params.q,
          params: params as any,
          results: total,
          tookMs,
        },
      });
    }

    res.json({
      products: products.map(product => ({
        ...product,
        isFavorite: product.favoriteProducts?.length > 0,
        favoriteProducts: undefined, // Remove from response
      })),
      facets,
      meta: {
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
        tookMs,
        expandedRadius: proximityVendorIds.length > 0 && params.radius < 50,
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Search failed' });
  }
});

// Facets endpoint
router.get('/facets', async (req, res) => {
  try {
    const params = searchQuerySchema.parse(req.query);
    
    // Build same where clause as search
    let whereClause: any = {
      active: true,
      availableNow: params.openNow ? true : undefined,
    };

    if (params.q) {
      whereClause.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q } },
      ];
    }

    const facets = await calculateFacets(whereClause, params);
    res.json(facets);

  } catch (error) {
    console.error('Facets error:', error);
    res.status(500).json({ error: 'Failed to get facets' });
  }
});

// Nearby windows endpoint
router.get('/nearby-windows', async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const radiusMeters = Number(radius) * 1609.34;
    
    const windows = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      type: string;
      address_text: string;
      fulfill_start_at: Date;
      fulfill_end_at: Date;
      vendor_id: string;
      vendor_name: string;
      distance_meters: number;
    }>>`
      SELECT 
        sw.id,
        sw.name,
        sw.type,
        sw.address_text,
        sw.fulfill_start_at,
        sw.fulfill_end_at,
        sw.vendor_id,
        vp.store_name as vendor_name,
        ST_DistanceSphere(sw.geo_point, ST_MakePoint(${lng}, ${lat})) as distance_meters
      FROM "SalesWindow" sw
      JOIN "VendorProfile" vp ON sw.vendor_id = vp.id
      WHERE sw.status = 'ACTIVE' 
        AND sw.geo_point IS NOT NULL
        AND sw.fulfill_start_at <= NOW() 
        AND sw.fulfill_end_at >= NOW()
        AND ST_DWithin(sw.geo_point, ST_MakePoint(${lng}, ${lat}), ${radiusMeters})
      ORDER BY distance_meters ASC
      LIMIT 50
    `;

    res.json({ windows });

  } catch (error) {
    console.error('Nearby windows error:', error);
    res.status(500).json({ error: 'Failed to get nearby windows' });
  }
});

// Helper function to calculate facets
async function calculateFacets(whereClause: any, params: any) {
  const [
    categories,
    priceRanges,
    tags,
    fulfillment,
    ratings,
    cities,
    states,
  ] = await Promise.all([
    // Categories
    prisma.product.groupBy({
      by: ['type'],
      where: whereClause,
      _count: { type: true },
    }),
    
    // Price ranges (simplified)
    prisma.$queryRaw<Array<{ range: string; count: number }>>`
      SELECT 
        CASE 
          WHEN price < 10 THEN 'Under $10'
          WHEN price < 25 THEN '$10-$25'
          WHEN price < 50 THEN '$25-$50'
          WHEN price < 100 THEN '$50-$100'
          ELSE 'Over $100'
        END as range,
        COUNT(*) as count
      FROM "Product" 
      WHERE ${JSON.stringify(whereClause)}
      GROUP BY range
    `,
    
    // Tags (top 20)
    prisma.product.findMany({
      where: whereClause,
      select: { tags: true },
      take: 1000,
    }).then(products => {
      const tagCounts: Record<string, number> = {};
      products.forEach(product => {
        if (product.tags) {
          const tags = JSON.parse(product.tags);
          tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      return Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));
    }),
    
    // Fulfillment
    Promise.all([
      prisma.product.count({ where: { ...whereClause, pickup: true } }),
      prisma.product.count({ where: { ...whereClause, delivery: true } }),
      prisma.product.count({ where: { ...whereClause, ship: true } }),
    ]).then(([pickup, delivery, ship]) => [
      { type: 'pickup', count: pickup },
      { type: 'delivery', count: delivery },
      { type: 'ship', count: ship },
    ]),
    
    // Ratings
    prisma.product.groupBy({
      by: ['ratingAvg'],
      where: whereClause,
      _count: { ratingAvg: true },
    }).then(ratings => ratings.map(r => ({
      rating: Math.floor(r.ratingAvg),
      count: r._count.ratingAvg,
    }))),
    
    // Cities
    prisma.product.findMany({
      where: whereClause,
      include: { vendor: { select: { city: true } } },
      take: 1000,
    }).then(products => {
      const cityCounts: Record<string, number> = {};
      products.forEach(product => {
        if (product.vendor.city) {
          cityCounts[product.vendor.city] = (cityCounts[product.vendor.city] || 0) + 1;
        }
      });
      return Object.entries(cityCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([city, count]) => ({ city, count }));
    }),
    
    // States
    prisma.product.findMany({
      where: whereClause,
      include: { vendor: { select: { state: true } } },
      take: 1000,
    }).then(products => {
      const stateCounts: Record<string, number> = {};
      products.forEach(product => {
        if (product.vendor.state) {
          stateCounts[product.vendor.state] = (stateCounts[product.vendor.state] || 0) + 1;
        }
      });
      return Object.entries(stateCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([state, count]) => ({ state, count }));
    }),
  ]);

  return {
    categories: categories.map(c => ({ category: c.type, count: c._count.type })),
    priceRanges,
    tags,
    fulfillment,
    ratings,
    cities,
    states,
  };
}

export default router;
