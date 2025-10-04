import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';

const router = Router();

// Validation schemas
const createInventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  current_qty: z.number().default(0),
  reorder_point: z.number().default(0),
  preferred_qty: z.number().default(0),
  avg_cost: z.number().default(0),
  last_cost: z.number().default(0),
  supplier_name: z.string().optional(),
  location: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

const updateInventoryItemSchema = createInventoryItemSchema.partial();

const receiveInventorySchema = z.object({
  qty: z.number().positive(),
  unit_cost: z.number().positive(),
  supplier_name: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const adjustInventorySchema = z.object({
  qtyDelta: z.number(),
  notes: z.string().optional(),
});

const consumeInventorySchema = z.object({
  qty: z.number().positive(),
  refType: z.string().optional(),
  refId: z.string().optional(),
  notes: z.string().optional(),
});

const wasteInventorySchema = z.object({
  qty: z.number().positive(),
  reason: z.string().optional(),
});

const donateInventorySchema = z.object({
  qty: z.number().positive(),
  recipient: z.string().optional(),
});

// GET /api/vendor/inventory - List inventory items with filtering
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const {
      query = '',
      category = '',
      status = '',
      sort = 'name',
      page = '1',
      pageSize = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {
      vendorProfileId: vendorId,
    };

    if (query) {
      where.name = {
        contains: query as string,
        mode: 'insensitive'
      };
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      switch (status) {
        case 'low_stock':
          where.current_qty = {
            lte: where.reorder_point
          };
          break;
        case 'expired':
          where.expiry_date = {
            lt: new Date()
          };
          break;
        case 'on_watchlist':
          where.priceWatches = {
            some: {
              active: true
            }
          };
          break;
      }
    }

    // Build orderBy clause
    let orderBy: any = { name: 'asc' };
    switch (sort) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'qty':
        orderBy = { current_qty: 'asc' };
        break;
      case 'cost':
        orderBy = { avg_cost: 'desc' };
        break;
      case 'expiry':
        orderBy = { expiry_date: 'asc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy,
        skip,
        take: pageSizeNum,
        include: {
          priceWatches: {
            where: { active: true }
          },
          movements: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    // Calculate KPIs
    const kpis = await prisma.inventoryItem.aggregate({
      where: { vendorProfileId: vendorId },
      _sum: {
        current_qty: true
      },
      _count: true
    });

    const lowStockItems = await prisma.inventoryItem.findMany({
      where: { vendorProfileId: vendorId },
      select: { current_qty: true, reorder_point: true }
    });
    
    const lowStockCount = lowStockItems.filter(item => 
      Number(item.current_qty) <= Number(item.reorder_point)
    ).length;

    const expiredCount = await prisma.inventoryItem.count({
      where: {
        vendorProfileId: vendorId,
        expiry_date: {
          lt: new Date()
        }
      }
    });

    const totalValue = await prisma.inventoryItem.aggregate({
      where: { vendorProfileId: vendorId },
      _sum: {
        current_qty: true,
        avg_cost: true
      }
    });

    res.json({
      items,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum)
      },
      kpis: {
        totalItems: kpis._count,
        lowStockCount,
        expiredCount,
        totalValue: (totalValue._sum.current_qty || 0) * (totalValue._sum.avg_cost || 0)
      }
    });
  } catch (error) {
    logger.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// POST /api/vendor/inventory - Create new inventory item
router.post('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createInventoryItemSchema.parse(req.body);
    
    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        vendorProfileId: vendorId,
        tags: JSON.stringify(data.tags)
      }
    });

    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT /api/vendor/inventory/:id - Update inventory item
router.put('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = updateInventoryItemSchema.parse(req.body);

    // Verify ownership
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: updateData
    });

    res.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// POST /api/vendor/inventory/:id/receive - Receive inventory
router.post('/:id/receive', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = receiveInventorySchema.parse(req.body);

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Calculate new average cost using moving average
    const newQty = Number(item.current_qty) + data.qty;
    const newAvgCost = newQty > 0 
      ? ((Number(item.current_qty) * Number(item.avg_cost)) + (data.qty * data.unit_cost)) / newQty
      : data.unit_cost;

    // Update item and create movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: {
          current_qty: newQty,
          avg_cost: newAvgCost,
          last_cost: data.unit_cost,
          supplier_name: data.supplier_name || item.supplier_name,
          batch_number: data.batch_number || item.batch_number,
          expiry_date: data.expiry_date ? new Date(data.expiry_date) : item.expiry_date,
        }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: id,
          type: 'RECEIVE',
          qty: data.qty,
          unit_cost: data.unit_cost,
          notes: data.notes
        }
      });

      return { item: updatedItem, movement };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error receiving inventory:', error);
    res.status(500).json({ error: 'Failed to receive inventory' });
  }
});

// POST /api/vendor/inventory/:id/adjust - Adjust inventory quantity
router.post('/:id/adjust', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = adjustInventorySchema.parse(req.body);

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const newQty = Math.max(0, Number(item.current_qty) + data.qtyDelta);

    // Update item and create movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { current_qty: newQty }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: id,
          type: 'ADJUST',
          qty: data.qtyDelta,
          notes: data.notes
        }
      });

      return { item: updatedItem, movement };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error adjusting inventory:', error);
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

// POST /api/vendor/inventory/:id/consume - Consume inventory
router.post('/:id/consume', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = consumeInventorySchema.parse(req.body);

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (Number(item.current_qty) < data.qty) {
      return res.status(400).json({ 
        error: 'Insufficient inventory', 
        available: Number(item.current_qty),
        requested: data.qty 
      });
    }

    const newQty = Number(item.current_qty) - data.qty;

    // Update item and create movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { current_qty: newQty }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: id,
          type: 'CONSUME',
          qty: -data.qty,
          refType: data.refType,
          refId: data.refId,
          notes: data.notes
        }
      });

      return { item: updatedItem, movement };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error consuming inventory:', error);
    res.status(500).json({ error: 'Failed to consume inventory' });
  }
});

// POST /api/vendor/inventory/:id/waste - Mark inventory as waste
router.post('/:id/waste', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = wasteInventorySchema.parse(req.body);

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (Number(item.current_qty) < data.qty) {
      return res.status(400).json({ 
        error: 'Insufficient inventory', 
        available: Number(item.current_qty),
        requested: data.qty 
      });
    }

    const newQty = Number(item.current_qty) - data.qty;

    // Update item and create movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { current_qty: newQty }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: id,
          type: 'WASTE',
          qty: -data.qty,
          notes: data.reason
        }
      });

      return { item: updatedItem, movement };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error marking inventory as waste:', error);
    res.status(500).json({ error: 'Failed to mark inventory as waste' });
  }
});

// POST /api/vendor/inventory/:id/donate - Donate inventory
router.post('/:id/donate', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const data = donateInventorySchema.parse(req.body);

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    if (Number(item.current_qty) < data.qty) {
      return res.status(400).json({ 
        error: 'Insufficient inventory', 
        available: Number(item.current_qty),
        requested: data.qty 
      });
    }

    const newQty = Number(item.current_qty) - data.qty;

    // Update item and create movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { current_qty: newQty }
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: id,
          type: 'DONATION',
          qty: -data.qty,
          notes: data.recipient
        }
      });

      return { item: updatedItem, movement };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error donating inventory:', error);
    res.status(500).json({ error: 'Failed to donate inventory' });
  }
});

// GET /api/vendor/inventory/:id/movements - Get movement history
router.get('/:id/movements', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;
    const { range = '30' } = req.query;

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const days = parseInt(range as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        vendorProfileId: vendorId,
        inventoryItemId: id,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        inventoryItem: {
          select: { name: true, unit: true }
        }
      }
    });

    res.json(movements);
  } catch (error) {
    logger.error('Error fetching inventory movements:', error);
    res.status(500).json({ error: 'Failed to fetch inventory movements' });
  }
});

// DELETE /api/vendor/inventory/:id - Delete inventory item
router.delete('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;

    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id, vendorProfileId: vendorId },
      include: { movements: true }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // If item has movements, archive instead of delete
    if (item.movements.length > 0) {
      await prisma.inventoryItem.update({
        where: { id },
        data: { 
          // Add archived flag or move to archive table
          // For now, just update the name to indicate it's archived
          name: `[ARCHIVED] ${item.name}`
        }
      });
      res.json({ message: 'Item archived due to movement history' });
    } else {
      await prisma.inventoryItem.delete({
        where: { id }
      });
      res.json({ message: 'Item deleted successfully' });
    }
  } catch (error) {
    logger.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

export default router;