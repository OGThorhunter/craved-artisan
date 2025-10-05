import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/session-simple';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
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
  }),
});

// Create saved search
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const data = createSavedSearchSchema.parse(req.body);

    // Check if name already exists for this user
    const existingSearch = await prisma.savedSearch.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingSearch) {
      return res.status(400).json({ error: 'A saved search with this name already exists' });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name: data.name,
        params: data.params as any,
      },
    });

    res.status(201).json({
      id: savedSearch.id,
      name: savedSearch.name,
      params: savedSearch.params,
      createdAt: savedSearch.createdAt,
    });

  } catch (error) {
    console.error('Create saved search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create saved search' });
  }
});

// Get user's saved searches
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      searches: savedSearches.map(search => ({
        id: search.id,
        name: search.name,
        params: search.params,
        createdAt: search.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ error: 'Failed to get saved searches' });
  }
});

// Delete saved search
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    res.json({ message: 'Saved search deleted successfully' });

  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ error: 'Failed to delete saved search' });
  }
});

// Update saved search
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const data = createSavedSearchSchema.parse(req.body);

    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    // Check if new name conflicts with existing searches
    if (data.name !== savedSearch.name) {
      const existingSearch = await prisma.savedSearch.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: id },
        },
      });

      if (existingSearch) {
        return res.status(400).json({ error: 'A saved search with this name already exists' });
      }
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        name: data.name,
        params: data.params as any,
      },
    });

    res.json({
      id: updatedSearch.id,
      name: updatedSearch.name,
      params: updatedSearch.params,
      createdAt: updatedSearch.createdAt,
    });

  } catch (error) {
    console.error('Update saved search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update saved search' });
  }
});

// Execute saved search
router.post('/:id/execute', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { page = 1, pageSize = 24 } = req.body;

    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!savedSearch) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    // Build query parameters from saved search
    const params = savedSearch.params as any;
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.priceMin) queryParams.append('priceMin', params.priceMin.toString());
    if (params.priceMax) queryParams.append('priceMax', params.priceMax.toString());
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params.fulfillment?.length) queryParams.append('fulfillment', params.fulfillment.join(','));
    if (params.vendorsOnly) queryParams.append('vendorsOnly', 'true');
    if (params.favoritesOnly) queryParams.append('favoritesOnly', 'true');
    if (params.openNow) queryParams.append('openNow', 'true');
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.national) queryParams.append('national', 'true');
    if (params.myVendors) queryParams.append('myVendors', 'true');
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.lng) queryParams.append('lng', params.lng.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());

    queryParams.append('page', page.toString());
    queryParams.append('pageSize', pageSize.toString());

    // Redirect to search endpoint with parameters
    res.redirect(`/api/market/search?${queryParams.toString()}`);

  } catch (error) {
    console.error('Execute saved search error:', error);
    res.status(500).json({ error: 'Failed to execute saved search' });
  }
});

export default router;
