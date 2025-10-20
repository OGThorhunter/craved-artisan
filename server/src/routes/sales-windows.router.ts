import { Router } from 'express';
import { z } from 'zod';
import { requireVendorAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Zod validation schemas
const SalesWindowTypeSchema = z.enum([
  'PARK_PICKUP',
  'DELIVERY',
  'CONSIGNMENT',
  'WHOLESALE',
  'MARKET',
  'PORCH_PICKUP',
  'KIOSK_PICKUP',
  'SERVICE_GREENFIELD'
]);

const SalesWindowStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'OPEN',
  'CLOSED',
  'FULFILLED',
  'CANCELLED'
]);

const StaticMapModeSchema = z.enum(['NONE', 'UPLOAD', 'TILE_URL']);
const DeliveryFeeModeSchema = z.enum(['NONE', 'FLAT', 'TIERED', 'FREE_OVER']);
const SchedulingModeSchema = z.enum(['VENDOR_CONTACT', 'SCHEDULER']);

const createSalesWindowSchema = z.object({
  type: SalesWindowTypeSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: SalesWindowStatusSchema.default('DRAFT'),
  
  // Location
  location_name: z.string().optional(),
  address_text: z.string().optional(),
  
  // Static Map
  static_map_mode: StaticMapModeSchema.default('NONE'),
  static_map_image_url: z.string().url().optional(),
  static_map_tile_url_template: z.string().optional(),
  
  // Vehicle Safety
  vendor_vehicle_image_url: z.string().url().optional(),
  vendor_vehicle_plate: z.string().optional(),
  
  // Delivery
  epicenter_address: z.string().optional(),
  radius_miles: z.number().positive().optional(),
  delivery_fee_mode: DeliveryFeeModeSchema.default('NONE'),
  delivery_fee_json: z.string().optional(),
  third_party_delivery: z.string().optional(),
  
  // Timing
  preorder_open_at: z.string().datetime().optional(),
  preorder_close_at: z.string().datetime().optional(),
  fulfill_start_at: z.string().datetime().optional(),
  fulfill_end_at: z.string().datetime().optional(),
  recurrence_rrule: z.string().optional(),
  parent_series_id: z.string().optional(),
  
  // Service - Greenfield
  is_always_on: z.boolean().default(false),
  scheduling_mode: SchedulingModeSchema.optional(),
  scheduler_config: z.string().optional(),
  
  // Capacity
  capacity_total: z.number().int().positive().optional(),
  slot_size_min: z.number().int().positive().optional(),
  slot_capacity: z.number().int().positive().optional(),
  max_items_total: z.number().int().positive().optional(),
  auto_close_when_full: z.boolean().default(true),
  
  // Porch/Kiosk
  porch_instructions: z.string().optional(),
  kiosk_name: z.string().optional(),
  kiosk_instructions: z.string().optional(),
  
  // Policies
  policy_json: z.string().optional(),
});

// GET /api/vendor/sales-windows
router.get('/', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { status, q, page = '1', pageSize = '20', type } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);
    
    const where: any = {
      vendorId,
    };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (q) {
      where.OR = [
        { name: { contains: q as string } },
        { description: { contains: q as string } },
      ];
    }
    
    const [windows, total] = await Promise.all([
      prisma.salesWindow.findMany({
        where,
        skip,
        take,
        include: {
          products: true,
          metrics: true,
          slots: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.salesWindow.count({ where }),
    ]);
    
    return res.json({
      success: true,
      data: windows,
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error fetching sales windows:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales windows',
    });
  }
});

// POST /api/vendor/sales-windows
router.post('/', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
      });
    }
    
    const validation = createSalesWindowSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const data = validation.data;
    
    // Convert datetime strings to Date objects
    const windowData: any = {
      ...data,
      vendorId,
      preorder_open_at: data.preorder_open_at ? new Date(data.preorder_open_at) : null,
      preorder_close_at: data.preorder_close_at ? new Date(data.preorder_close_at) : null,
      fulfill_start_at: data.fulfill_start_at ? new Date(data.fulfill_start_at) : null,
      fulfill_end_at: data.fulfill_end_at ? new Date(data.fulfill_end_at) : null,
    };
    
    const window = await prisma.salesWindow.create({
      data: windowData,
      include: {
        products: true,
        metrics: true,
        slots: true,
      },
    });
    
    // Create initial metrics record
    await prisma.salesWindowMetric.create({
      data: {
        salesWindowId: window.id,
      },
    });
    
    return res.json({
      success: true,
      data: window,
    });
  } catch (error) {
    console.error('Error creating sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sales window',
    });
  }
});

// GET /api/vendor/sales-windows/:id
router.get('/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
      include: {
        products: true,
        metrics: true,
        slots: true,
        consignment: true,
        wholesaleInvoices: {
          include: {
            lines: true,
          },
        },
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    return res.json({
      success: true,
      data: window,
    });
  } catch (error) {
    console.error('Error fetching sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales window',
    });
  }
});

// PUT /api/vendor/sales-windows/:id
router.put('/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    const existingWindow = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
    });
    
    if (!existingWindow) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    const validation = createSalesWindowSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.errors,
      });
    }
    
    const data = validation.data;
    
    // Convert datetime strings to Date objects
    const updateData: any = { ...data };
    if (data.preorder_open_at) {
      updateData.preorder_open_at = new Date(data.preorder_open_at);
    }
    if (data.preorder_close_at) {
      updateData.preorder_close_at = new Date(data.preorder_close_at);
    }
    if (data.fulfill_start_at) {
      updateData.fulfill_start_at = new Date(data.fulfill_start_at);
    }
    if (data.fulfill_end_at) {
      updateData.fulfill_end_at = new Date(data.fulfill_end_at);
    }
    
    const window = await prisma.salesWindow.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
        metrics: true,
        slots: true,
      },
    });
    
    return res.json({
      success: true,
      data: window,
    });
  } catch (error) {
    console.error('Error updating sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update sales window',
    });
  }
});

// POST /api/vendor/sales-windows/:id/open
router.post('/:id/open', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
      include: {
        metrics: true,
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    // Check if window is at capacity
    if (window.max_items_total && window.metrics) {
      if (window.metrics.items_count >= window.max_items_total) {
        return res.status(400).json({
          success: false,
          message: 'Cannot open window - already at capacity',
        });
      }
    }
    
    const updatedWindow = await prisma.salesWindow.update({
      where: { id },
      data: {
        status: 'OPEN',
      },
      include: {
        products: true,
        metrics: true,
        slots: true,
      },
    });
    
    return res.json({
      success: true,
      data: updatedWindow,
      message: 'Sales window opened successfully',
    });
  } catch (error) {
    console.error('Error opening sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to open sales window',
    });
  }
});

// POST /api/vendor/sales-windows/:id/close
router.post('/:id/close', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    const updatedWindow = await prisma.salesWindow.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
      include: {
        products: true,
        metrics: true,
        slots: true,
      },
    });
    
    return res.json({
      success: true,
      data: updatedWindow,
      message: 'Sales window closed successfully',
    });
  } catch (error) {
    console.error('Error closing sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to close sales window',
    });
  }
});

// POST /api/vendor/sales-windows/:id/duplicate
router.post('/:id/duplicate', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
      include: {
        products: true,
        slots: true,
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    // Duplicate the window
    const { id: _id, createdAt, updatedAt, products, slots, ...windowData } = window as any;
    
    const duplicatedWindow = await prisma.salesWindow.create({
      data: {
        ...windowData,
        name: `${window.name} (Copy)`,
        status: 'DRAFT',
        products: {
          create: products.map(({ id, salesWindowId, ...p }: any) => p),
        },
      },
      include: {
        products: true,
        metrics: true,
        slots: true,
      },
    });
    
    // Create initial metrics
    await prisma.salesWindowMetric.create({
      data: {
        salesWindowId: duplicatedWindow.id,
      },
    });
    
    return res.json({
      success: true,
      data: duplicatedWindow,
      message: 'Sales window duplicated successfully',
    });
  } catch (error) {
    console.error('Error duplicating sales window:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to duplicate sales window',
    });
  }
});

// POST /api/vendor/sales-windows/:id/products/bulk
router.post('/:id/products/bulk', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    const { products } = req.body;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    // Delete existing products and create new ones
    await prisma.salesWindowProduct.deleteMany({
      where: {
        salesWindowId: id,
      },
    });
    
    const createdProducts = await prisma.salesWindowProduct.createMany({
      data: products.map((p: any) => ({
        salesWindowId: id,
        productId: p.productId,
        price_override: p.price_override,
        qty_limit_per_customer: p.qty_limit_per_customer,
        active: p.active !== undefined ? p.active : true,
      })),
    });
    
    return res.json({
      success: true,
      data: createdProducts,
      message: 'Products updated successfully',
    });
  } catch (error) {
    console.error('Error updating products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update products',
    });
  }
});

// POST /api/vendor/sales-windows/:id/slots
router.post('/:id/slots', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    const { id } = req.params;
    const { slot_length_min, slot_capacity, start_time, end_time } = req.body;
    
    const window = await prisma.salesWindow.findFirst({
      where: {
        id,
        vendorId,
      },
    });
    
    if (!window) {
      return res.status(404).json({
        success: false,
        message: 'Sales window not found',
      });
    }
    
    // Generate slots
    const slots = [];
    let currentTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slot_length_min * 60000);
      slots.push({
        salesWindowId: id,
        starts_at: currentTime,
        ends_at: slotEnd,
        capacity: slot_capacity,
      });
      currentTime = slotEnd;
    }
    
    // Delete existing slots and create new ones
    await prisma.salesWindowSlot.deleteMany({
      where: {
        salesWindowId: id,
      },
    });
    
    const createdSlots = await prisma.salesWindowSlot.createMany({
      data: slots,
    });
    
    return res.json({
      success: true,
      data: createdSlots,
      message: 'Slots created successfully',
    });
  } catch (error) {
    console.error('Error creating slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create slots',
    });
  }
});

export default router;

