import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';
import { Parser } from 'json2csv';

const router = Router();

// Validation schemas
const exportInventorySchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  includeMovements: z.boolean().default(false),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

// GET /api/vendor/inventory/export - Export inventory data
router.get('/export', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = exportInventorySchema.parse(req.query);

    // Build where clause
    const where: any = {
      vendorProfileId: vendorId,
    };

    if (data.category) {
      where.category = data.category;
    }

    if (data.status) {
      switch (data.status) {
        case 'low_stock':
          where.current_qty = {
            lte: prisma.inventoryItem.fields.reorder_point
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

    // Fetch inventory items
    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        priceWatches: {
          where: { active: true }
        },
        movements: data.includeMovements ? {
          where: data.dateRange ? {
            createdAt: {
              gte: data.dateRange.start ? new Date(data.dateRange.start) : undefined,
              lte: data.dateRange.end ? new Date(data.dateRange.end) : undefined
            }
          } : undefined,
          orderBy: { createdAt: 'desc' }
        } : false
      },
      orderBy: { name: 'asc' }
    });

    // Format data for export
    const exportData = items.map(item => {
      const baseData = {
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        current_qty: Number(item.current_qty),
        reorder_point: Number(item.reorder_point),
        preferred_qty: Number(item.preferred_qty),
        avg_cost: Number(item.avg_cost),
        last_cost: Number(item.last_cost),
        total_value: Number(item.current_qty) * Number(item.avg_cost),
        supplier_name: item.supplier_name,
        location: item.location,
        batch_number: item.batch_number,
        expiry_date: item.expiry_date?.toISOString(),
        tags: item.tags ? JSON.parse(item.tags) : [],
        has_price_watch: item.priceWatches.length > 0,
        price_watch_count: item.priceWatches.length,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
      };

      if (data.includeMovements && item.movements) {
        return {
          ...baseData,
          movements: item.movements.map(movement => ({
            movement_id: movement.id,
            movement_type: movement.type,
            movement_qty: Number(movement.qty),
            movement_unit_cost: movement.unit_cost ? Number(movement.unit_cost) : null,
            movement_ref_type: movement.refType,
            movement_ref_id: movement.refId,
            movement_notes: movement.notes,
            movement_created_at: movement.createdAt.toISOString()
          }))
        };
      }

      return baseData;
    });

    if (data.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } else {
      // CSV export
      const fields = [
        'id',
        'name',
        'category',
        'unit',
        'current_qty',
        'reorder_point',
        'preferred_qty',
        'avg_cost',
        'last_cost',
        'total_value',
        'supplier_name',
        'location',
        'batch_number',
        'expiry_date',
        'tags',
        'has_price_watch',
        'price_watch_count',
        'created_at',
        'updated_at'
      ];

      if (data.includeMovements) {
        fields.push('movements');
      }

      const parser = new Parser({ fields });
      const csv = parser.parse(exportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error exporting inventory:', error);
    res.status(500).json({ error: 'Failed to export inventory' });
  }
});

// GET /api/vendor/inventory/export/movements - Export movement history
router.get('/export/movements', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { 
      format = 'csv',
      startDate,
      endDate,
      itemId,
      type
    } = req.query;

    // Build where clause
    const where: any = {
      vendorProfileId: vendorId,
    };

    if (itemId) {
      where.inventoryItemId = itemId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Fetch movements
    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        inventoryItem: {
          select: {
            name: true,
            unit: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format data for export
    const exportData = movements.map(movement => ({
      id: movement.id,
      item_name: movement.inventoryItem.name,
      item_category: movement.inventoryItem.category,
      item_unit: movement.inventoryItem.unit,
      type: movement.type,
      qty: Number(movement.qty),
      unit_cost: movement.unit_cost ? Number(movement.unit_cost) : null,
      ref_type: movement.refType,
      ref_id: movement.refId,
      notes: movement.notes,
      created_at: movement.createdAt.toISOString()
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-movements-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } else {
      // CSV export
      const fields = [
        'id',
        'item_name',
        'item_category',
        'item_unit',
        'type',
        'qty',
        'unit_cost',
        'ref_type',
        'ref_id',
        'notes',
        'created_at'
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(exportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-movements-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    logger.error('Error exporting inventory movements:', error);
    res.status(500).json({ error: 'Failed to export inventory movements' });
  }
});

// GET /api/vendor/inventory/export/insights - Export insights data
router.get('/export/insights', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { format = 'json' } = req.query;

    // Get restock alerts
    const restockAlerts = await prisma.inventoryItem.findMany({
      where: {
        vendorProfileId: vendorId,
        current_qty: {
          lte: prisma.inventoryItem.fields.reorder_point
        }
      },
      include: {
        priceWatches: {
          where: { active: true }
        }
      },
      orderBy: {
        current_qty: 'asc'
      }
    });

    // Get expired items
    const expiredItems = await prisma.inventoryItem.findMany({
      where: {
        vendorProfileId: vendorId,
        expiry_date: {
          lt: new Date()
        }
      },
      orderBy: {
        expiry_date: 'asc'
      }
    });

    // Get items expiring soon (next 7 days)
    const expiringSoon = await prisma.inventoryItem.findMany({
      where: {
        vendorProfileId: vendorId,
        expiry_date: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        expiry_date: 'asc'
      }
    });

    // Get price watch hits
    const priceWatchHits = await prisma.priceWatch.findMany({
      where: {
        vendorProfileId: vendorId,
        active: true
      },
      include: {
        inventoryItem: true
      }
    });

    // Format insights data
    const insightsData = {
      export_date: new Date().toISOString(),
      vendor_id: vendorId,
      restock_alerts: restockAlerts.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        reorder_point: Number(item.reorder_point),
        preferred_qty: Number(item.preferred_qty),
        suggested_qty: Math.max(0, Number(item.preferred_qty) - Number(item.current_qty)),
        avg_cost: Number(item.avg_cost),
        unit: item.unit,
        priority: Number(item.current_qty) <= 0 ? 'CRITICAL' : 'HIGH',
        has_price_watch: item.priceWatches.length > 0
      })),
      expired_items: expiredItems.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        expiry_date: item.expiry_date?.toISOString(),
        unit: item.unit,
        days_expired: Math.floor((Date.now() - (item.expiry_date?.getTime() || 0)) / (1000 * 60 * 60 * 24))
      })),
      expiring_soon: expiringSoon.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        expiry_date: item.expiry_date?.toISOString(),
        unit: item.unit,
        days_until_expiry: Math.ceil(((item.expiry_date?.getTime() || 0) - Date.now()) / (1000 * 60 * 60 * 24))
      })),
      price_watch_hits: priceWatchHits.map(watch => ({
        id: watch.id,
        item_name: watch.inventoryItem.name,
        item_unit: watch.inventoryItem.unit,
        target_unit_cost: Number(watch.target_unit_cost),
        current_avg_cost: Number(watch.inventoryItem.avg_cost),
        savings_pct: ((Number(watch.inventoryItem.avg_cost) - Number(watch.target_unit_cost)) / Number(watch.inventoryItem.avg_cost)) * 100,
        source: watch.source
      }))
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-insights-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(insightsData);
    } else {
      // For CSV, flatten the data
      const csvData = [
        ...insightsData.restock_alerts.map(item => ({
          type: 'restock_alert',
          ...item
        })),
        ...insightsData.expired_items.map(item => ({
          type: 'expired_item',
          ...item
        })),
        ...insightsData.expiring_soon.map(item => ({
          type: 'expiring_soon',
          ...item
        })),
        ...insightsData.price_watch_hits.map(item => ({
          type: 'price_watch_hit',
          ...item
        }))
      ];

      const fields = [
        'type',
        'id',
        'name',
        'current_qty',
        'reorder_point',
        'preferred_qty',
        'suggested_qty',
        'avg_cost',
        'unit',
        'priority',
        'has_price_watch',
        'expiry_date',
        'days_expired',
        'days_until_expiry',
        'item_name',
        'item_unit',
        'target_unit_cost',
        'current_avg_cost',
        'savings_pct',
        'source'
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-insights-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    logger.error('Error exporting inventory insights:', error);
    res.status(500).json({ error: 'Failed to export inventory insights' });
  }
});

export default router;