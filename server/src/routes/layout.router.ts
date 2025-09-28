import express from 'express';
import { z } from 'zod';
import { logger } from '../logger';

const router = express.Router();

// Validation schemas
const CreateLayoutSchema = z.object({
  eventId: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  layoutType: z.enum(['GRID', 'IMAGE_OVERLAY']).default('GRID'),
  
  // Grid configuration
  gridRows: z.number().int().positive().optional(),
  gridColumns: z.number().int().positive().optional(),
  cellWidth: z.number().positive().optional(),
  cellHeight: z.number().positive().optional(),
  aisleWidth: z.number().positive().optional(),
  totalWidth: z.number().positive().optional(),
  totalHeight: z.number().positive().optional(),
  
  // Image configuration
  backgroundImage: z.string().url().optional(),
  imageWidth: z.number().int().positive().optional(),
  imageHeight: z.number().int().positive().optional(),
  scaleFactor: z.number().positive().optional(),
  
  // Settings
  units: z.enum(['feet', 'meters']).default('feet'),
  showNumbers: z.boolean().default(true),
  showAisles: z.boolean().default(true),
  showGrid: z.boolean().default(true),
});

const CreateZoneSchema = z.object({
  layoutId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
  
  // Grid position
  startRow: z.number().int().positive().optional(),
  endRow: z.number().int().positive().optional(),
  startColumn: z.number().int().positive().optional(),
  endColumn: z.number().int().positive().optional(),
  
  // Pricing
  basePrice: z.number().nonnegative().default(0),
  priceUnit: z.enum(['stall', 'sqft', 'per_day']).default('stall'),
  
  // Features
  features: z.array(z.string()).default([]),
  
  // Settings
  isActive: z.boolean().default(true),
  autoNumbering: z.boolean().default(true),
  numberingPrefix: z.string().optional(),
});

const CreateStallSchema = z.object({
  layoutId: z.string(),
  zoneId: z.string().optional(),
  number: z.string().min(1).max(50),
  customLabel: z.string().optional(),
  
  // Grid position
  row: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  
  // Image position
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  
  // Properties
  stallType: z.enum(['STALL', 'CORNER_STALL', 'FOOD_TRUCK', 'TABLE_SEAT', 'VIP_SEAT']).default('STALL'),
  size: z.string().optional(),
  
  // Pricing
  basePrice: z.number().nonnegative().default(0),
  priceOverride: z.number().positive().optional(),
  surcharges: z.array(z.number()).default([]),
  
  // Features
  features: z.array(z.string()).default([]),
  
  // Status
  isBlocked: z.boolean().default(false),
  blockReason: z.string().optional(),
});

const UpdateStallStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'HELD', 'RESERVED', 'SOLD', 'CHECKED_IN', 'BLOCKED']),
  heldBy: z.string().optional(),
  heldUntil: z.string().datetime().optional(),
  holdReason: z.string().optional(),
  assignedTo: z.string().optional(),
});

// GET /api/layout/:eventId - Get layout for event
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // TODO: Implement with Prisma
    // const layout = await prisma.eventLayout.findUnique({
    //   where: { eventId },
    //   include: {
    //     zones: { orderBy: { name: 'asc' } },
    //     stalls: { 
    //       include: { zone: true, assignment: true },
    //       orderBy: [{ row: 'asc' }, { column: 'asc' }]
    //     }
    //   }
    // });
    
    const mockLayout = {
      id: 'layout_1',
      eventId,
      name: 'Main Market Layout',
      description: 'Standard market layout with zones A, B, and C',
      layoutType: 'GRID',
      gridRows: 10,
      gridColumns: 12,
      cellWidth: 10,
      cellHeight: 10,
      aisleWidth: 6,
      totalWidth: 126,
      totalHeight: 106,
      units: 'feet',
      showNumbers: true,
      showAisles: true,
      showGrid: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
      zones: [
        {
          id: 'zone_a',
          layoutId: 'layout_1',
          name: 'Zone A - Food Court',
          description: 'Food and beverage vendors',
          color: '#10B981',
          startRow: 1,
          endRow: 4,
          startColumn: 1,
          endColumn: 6,
          basePrice: 75.00,
          priceUnit: 'stall',
          features: ['power', 'water'],
          isActive: true,
          autoNumbering: true,
          numberingPrefix: 'A',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-02-10T00:00:00Z'
        },
        {
          id: 'zone_b',
          layoutId: 'layout_1',
          name: 'Zone B - Crafts',
          description: 'Handmade crafts and artisan goods',
          color: '#3B82F6',
          startRow: 1,
          endRow: 4,
          startColumn: 7,
          endColumn: 12,
          basePrice: 60.00,
          priceUnit: 'stall',
          features: ['power'],
          isActive: true,
          autoNumbering: true,
          numberingPrefix: 'B',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-02-10T00:00:00Z'
        }
      ],
      stalls: [
        {
          id: 'stall_a1',
          layoutId: 'layout_1',
          zoneId: 'zone_a',
          number: 'A1',
          row: 1,
          column: 1,
          stallType: 'STALL',
          size: '10x10',
          basePrice: 75.00,
          totalPrice: 75.00,
          features: ['power', 'water'],
          status: 'AVAILABLE',
          isBlocked: false,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-02-10T00:00:00Z',
          zone: {
            id: 'zone_a',
            name: 'Zone A - Food Court',
            color: '#10B981'
          }
        }
      ]
    };
    
    res.json({ success: true, data: mockLayout });
  } catch (error) {
    logger.error('Error fetching layout:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch layout' });
  }
});

// POST /api/layout - Create new layout
router.post('/', async (req, res) => {
  try {
    const validatedData = CreateLayoutSchema.parse(req.body);
    
    // TODO: Implement with Prisma
    // const layout = await prisma.eventLayout.create({
    //   data: validatedData
    // });
    
    const mockLayout = {
      id: 'layout_new',
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      zones: [],
      stalls: []
    };
    
    res.status(201).json({ success: true, data: mockLayout });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating layout:', error);
    res.status(500).json({ success: false, message: 'Failed to create layout' });
  }
});

// PUT /api/layout/:id - Update layout
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CreateLayoutSchema.partial().parse(req.body);
    
    // TODO: Implement with Prisma
    // const layout = await prisma.eventLayout.update({
    //   where: { id },
    //   data: validatedData
    // });
    
    const mockLayout = {
      id,
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: mockLayout });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error updating layout:', error);
    res.status(500).json({ success: false, message: 'Failed to update layout' });
  }
});

// POST /api/layout/:id/zones - Create zone
router.post('/:id/zones', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CreateZoneSchema.parse({ ...req.body, layoutId: id });
    
    // TODO: Implement with Prisma
    // const zone = await prisma.zone.create({
    //   data: validatedData
    // });
    
    const mockZone = {
      id: 'zone_new',
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, data: mockZone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating zone:', error);
    res.status(500).json({ success: false, message: 'Failed to create zone' });
  }
});

// POST /api/layout/:id/stalls - Create stall
router.post('/:id/stalls', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = CreateStallSchema.parse({ ...req.body, layoutId: id });
    
    // Calculate total price
    const totalPrice = validatedData.priceOverride || 
      (validatedData.basePrice + validatedData.surcharges.reduce((sum, charge) => sum + charge, 0));
    
    // TODO: Implement with Prisma
    // const stall = await prisma.stall.create({
    //   data: {
    //     ...validatedData,
    //     totalPrice
    //   }
    // });
    
    const mockStall = {
      id: 'stall_new',
      ...validatedData,
      totalPrice,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, data: mockStall });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error creating stall:', error);
    res.status(500).json({ success: false, message: 'Failed to create stall' });
  }
});

// PUT /api/layout/stalls/:stallId/status - Update stall status
router.put('/stalls/:stallId/status', async (req, res) => {
  try {
    const { stallId } = req.params;
    const validatedData = UpdateStallStatusSchema.parse(req.body);
    
    // TODO: Implement with Prisma
    // const stall = await prisma.stall.update({
    //   where: { id: stallId },
    //   data: {
    //     ...validatedData,
    //     heldUntil: validatedData.heldUntil ? new Date(validatedData.heldUntil) : null,
    //     assignedAt: validatedData.assignedTo ? new Date() : null
    //   }
    // });
    
    const mockStall = {
      id: stallId,
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: mockStall });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Error updating stall status:', error);
    res.status(500).json({ success: false, message: 'Failed to update stall status' });
  }
});

// GET /api/layout/templates - Get layout templates
router.get('/templates', async (req, res) => {
  try {
    const { category } = req.query;
    
    // TODO: Implement with Prisma
    // const templates = await prisma.layoutTemplate.findMany({
    //   where: category ? { category } : {},
    //   orderBy: { usageCount: 'desc' }
    // });
    
    const mockTemplates = [
      {
        id: 'template_1',
        name: 'Standard Market',
        description: 'Classic farmers market layout with food court and craft areas',
        category: 'market',
        layoutType: 'GRID',
        gridRows: 8,
        gridColumns: 10,
        cellWidth: 10,
        cellHeight: 10,
        aisleWidth: 6,
        usageCount: 45,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'template_2',
        name: 'Craft Fair',
        description: 'Indoor craft fair layout with premium corner spots',
        category: 'fair',
        layoutType: 'GRID',
        gridRows: 6,
        gridColumns: 8,
        cellWidth: 8,
        cellHeight: 8,
        aisleWidth: 4,
        usageCount: 32,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
    
    res.json({ success: true, data: mockTemplates });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
});

// POST /api/layout/:id/export - Export layout as PDF
router.post('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf', includeNumbers = true, includeLegend = true } = req.body;
    
    // TODO: Implement PDF generation
    // This would generate a printable layout with stalls, zones, and legend
    
    res.json({ 
      success: true, 
      message: 'Layout exported successfully',
      data: {
        downloadUrl: `/api/layout/${id}/download/layout.pdf`,
        format,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error exporting layout:', error);
    res.status(500).json({ success: false, message: 'Failed to export layout' });
  }
});

export default router;
