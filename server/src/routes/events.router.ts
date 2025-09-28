import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';

const router = express.Router();

// Validation schemas
const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  venue: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxCapacity: z.number().int().positive().optional(),
  categories: z.array(z.string()).optional().default([]),
  rules: z.string().optional(),
  coverImage: z.string().url().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
});

const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string(),
});

const EventSessionSchema = z.object({
  eventId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxCapacity: z.number().int().positive().optional(),
  overridePrice: z.number().positive().optional(),
});

const ApplicationSchema = z.object({
  eventId: z.string(),
  businessName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  products: z.array(z.string()).optional().default([]),
});

// GET /api/events - List events for coordinator
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // TODO: Implement with Prisma
    // const events = await prisma.event.findMany({
    //   where: { createdBy: req.user.id, ...(status && { status }) },
    //   include: { sessions: true, _count: { select: { applications: true } } },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' }
    // });
    
    // Mock data for now
    const mockEvents = [
      {
        id: 'evt_1',
        title: 'Locust Grove Artisan Market',
        description: 'A vibrant marketplace featuring local artisans, farmers, and food vendors.',
        venue: 'Locust Grove Farmers Market',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        startDate: '2024-03-15T09:00:00Z',
        endDate: '2024-03-15T17:00:00Z',
        maxCapacity: 60,
        categories: ['artisan', 'farmers-market', 'local'],
        coverImage: '/images/events/market-1.jpg',
        slug: 'locust-grove-artisan-market',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-10T00:00:00Z',
        sessions: [],
        applicationCount: 45
      }
    ];
    
    res.json({
      success: true,
      data: mockEvents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockEvents.length
      }
    });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement with Prisma
    // const event = await prisma.event.findUnique({
    //   where: { id },
    //   include: { 
    //     sessions: true, 
    //     applications: true,
    //     salesWindows: true,
    //     analytics: { orderBy: { date: 'desc' }, take: 30 }
    //   }
    // });
    
    const mockEvent = {
      id,
      title: 'Locust Grove Artisan Market',
      description: 'A vibrant marketplace featuring local artisans, farmers, and food vendors.',
      venue: 'Locust Grove Farmers Market',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-15T17:00:00Z',
      maxCapacity: 60,
      categories: ['artisan', 'farmers-market', 'local'],
      rules: 'No pets allowed. Set up begins at 7 AM.',
      coverImage: '/images/events/market-1.jpg',
      slug: 'locust-grove-artisan-market',
      isRecurring: false,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
      sessions: [],
      applications: [],
      salesWindows: [],
      analytics: []
    };
    
    res.json({ success: true, data: mockEvent });
  } catch (error) {
    logger.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    const validatedData = CreateEventSchema.parse(req.body);
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // TODO: Implement with Prisma
    // const event = await prisma.event.create({
    //   data: {
    //     ...validatedData,
    //     slug,
    //     createdBy: req.user.id,
    //     startDate: new Date(validatedData.startDate),
    //     endDate: new Date(validatedData.endDate),
    //   },
    //   include: { sessions: true }
    // });
    
    const mockEvent = {
      id: 'evt_new',
      ...validatedData,
      slug,
      status: 'DRAFT',
      visibility: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: []
    };
    
    res.status(201).json({ success: true, data: mockEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateEventSchema.parse({ ...req.body, id });
    
    // TODO: Implement with Prisma
    // const event = await prisma.event.update({
    //   where: { id },
    //   data: {
    //     ...validatedData,
    //     startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
    //     endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    //     updatedAt: new Date(),
    //   },
    //   include: { sessions: true }
    // });
    
    const mockEvent = {
      id,
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: mockEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// POST /api/events/:id/publish - Publish event
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement with Prisma
    // const event = await prisma.event.update({
    //   where: { id },
    //   data: { 
    //     status: 'PUBLISHED',
    //     visibility: 'PUBLIC',
    //     publishedAt: new Date()
    //   }
    // });
    
    res.json({ 
      success: true, 
      message: 'Event published successfully',
      data: { id, status: 'PUBLISHED', visibility: 'PUBLIC' }
    });
  } catch (error) {
    logger.error('Error publishing event:', error);
    res.status(500).json({ success: false, message: 'Failed to publish event' });
  }
});

// POST /api/events/:id/sessions - Add session to event
router.post('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = EventSessionSchema.parse({ ...req.body, eventId: id });
    
    // TODO: Implement with Prisma
    // const session = await prisma.eventSession.create({
    //   data: {
    //     ...validatedData,
    //     startTime: new Date(validatedData.startTime),
    //     endTime: new Date(validatedData.endTime),
    //   }
    // });
    
    const mockSession = {
      id: 'sess_new',
      ...validatedData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, data: mockSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating session:', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

// GET /api/events/:id/applications - Get applications for event
router.get('/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    // TODO: Implement with Prisma
    // const applications = await prisma.vendorApplication.findMany({
    //   where: { 
    //     eventId: id,
    //     ...(status && { status })
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' }
    // });
    
    const mockApplications = [
      {
        id: 'app_1',
        eventId: id,
        businessName: 'Rose Creek Bakery',
        contactName: 'Sarah Johnson',
        email: 'sarah@rosecreek.com',
        phone: '(555) 123-4567',
        category: 'Food & Beverage',
        description: 'Artisan breads and pastries',
        products: ['bread', 'pastries', 'coffee'],
        status: 'PENDING',
        documents: [],
        createdAt: '2024-02-01T00:00:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: mockApplications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockApplications.length
      }
    });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
});

// POST /api/events/:id/applications - Submit application
router.post('/:id/applications', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = ApplicationSchema.parse({ ...req.body, eventId: id });
    
    // TODO: Implement with Prisma
    // const application = await prisma.vendorApplication.create({
    //   data: validatedData
    // });
    
    const mockApplication = {
      id: 'app_new',
      ...validatedData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, data: mockApplication });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating application:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

export default router;
