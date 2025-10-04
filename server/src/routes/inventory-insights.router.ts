import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';

const router = Router();

// Validation schemas
const createPriceWatchSchema = z.object({
  inventoryItemId: z.string(),
  target_unit_cost: z.number().positive(),
  source: z.enum(['B2B', 'MARKET', 'CUSTOM_URL']),
  source_meta: z.string().optional(),
});

const shortfallCheckSchema = z.object({
  productId: z.string().optional(),
  windowId: z.string().optional(),
  orderDraft: z.array(z.object({
    productId: z.string(),
    qty: z.number().positive()
  })).optional(),
  timeWindowDays: z.number().default(14),
});

// GET /api/vendor/inventory/insights - Get AI insights
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    // Get restock alerts
    const allItems = await prisma.inventoryItem.findMany({
      where: { vendorProfileId: vendorId },
      select: { 
        id: true, 
        name: true, 
        current_qty: true, 
        reorder_point: true, 
        preferred_qty: true, 
        avg_cost: true, 
        unit: true,
        priceWatches: {
          where: { active: true }
        }
      }
    });
    
    const restockAlerts = allItems.filter(item => 
      Number(item.current_qty) <= Number(item.reorder_point)
    );

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

    // Get price watch hits (mock for now)
    const priceWatchHits = await prisma.priceWatch.findMany({
      where: {
        vendorProfileId: vendorId,
        active: true
      },
      include: {
        inventoryItem: true
      }
    });

    // Calculate seasonal forecasts (mock for now)
    const seasonalForecasts = await calculateSeasonalForecasts(vendorId);

    // Get upcoming commitments
    const upcomingCommitments = await getUpcomingCommitments(vendorId);

    res.json({
      restockAlerts: restockAlerts.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        reorder_point: Number(item.reorder_point),
        preferred_qty: Number(item.preferred_qty),
        suggested_qty: Math.max(0, Number(item.preferred_qty) - Number(item.current_qty)),
        avg_cost: Number(item.avg_cost),
        unit: item.unit,
        priority: Number(item.current_qty) <= 0 ? 'CRITICAL' : 'HIGH',
        hasPriceWatch: item.priceWatches.length > 0
      })),
      expiredItems: expiredItems.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        expiry_date: item.expiry_date,
        unit: item.unit,
        daysExpired: Math.floor((Date.now() - (item.expiry_date?.getTime() || 0)) / (1000 * 60 * 60 * 24))
      })),
      expiringSoon: expiringSoon.map(item => ({
        id: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        expiry_date: item.expiry_date,
        unit: item.unit,
        daysUntilExpiry: Math.ceil(((item.expiry_date?.getTime() || 0) - Date.now()) / (1000 * 60 * 60 * 24))
      })),
      priceWatchHits: priceWatchHits.map(watch => ({
        id: watch.id,
        inventoryItem: {
          id: watch.inventoryItem.id,
          name: watch.inventoryItem.name,
          unit: watch.inventoryItem.unit
        },
        target_unit_cost: Number(watch.target_unit_cost),
        current_avg_cost: Number(watch.inventoryItem.avg_cost),
        savings_pct: ((Number(watch.inventoryItem.avg_cost) - Number(watch.target_unit_cost)) / Number(watch.inventoryItem.avg_cost)) * 100,
        source: watch.source
      })),
      seasonalForecasts,
      upcomingCommitments
    });
  } catch (error) {
    logger.error('Error fetching inventory insights:', error);
    res.status(500).json({ error: 'Failed to fetch inventory insights' });
  }
});

// POST /api/vendor/inventory/price-watch - Create/update price watch
router.post('/price-watch', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = createPriceWatchSchema.parse(req.body);

    // Verify ownership of inventory item
    const item = await prisma.inventoryItem.findFirst({
      where: { 
        id: data.inventoryItemId, 
        vendorProfileId: vendorId 
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if price watch already exists
    const existingWatch = await prisma.priceWatch.findFirst({
      where: {
        vendorProfileId: vendorId,
        inventoryItemId: data.inventoryItemId,
        active: true
      }
    });

    let priceWatch;
    if (existingWatch) {
      // Update existing watch
      priceWatch = await prisma.priceWatch.update({
        where: { id: existingWatch.id },
        data: {
          target_unit_cost: data.target_unit_cost,
          source: data.source,
          source_meta: data.source_meta
        }
      });
    } else {
      // Create new watch
      priceWatch = await prisma.priceWatch.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: data.inventoryItemId,
          target_unit_cost: data.target_unit_cost,
          source: data.source,
          source_meta: data.source_meta
        }
      });
    }

    res.json(priceWatch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error creating price watch:', error);
    res.status(500).json({ error: 'Failed to create price watch' });
  }
});

// DELETE /api/vendor/inventory/price-watch/:id - Stop price watch
router.delete('/price-watch/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const { id } = req.params;

    const priceWatch = await prisma.priceWatch.findFirst({
      where: { id, vendorProfileId: vendorId }
    });

    if (!priceWatch) {
      return res.status(404).json({ error: 'Price watch not found' });
    }

    await prisma.priceWatch.update({
      where: { id },
      data: { active: false }
    });

    res.json({ message: 'Price watch stopped' });
  } catch (error) {
    logger.error('Error stopping price watch:', error);
    res.status(500).json({ error: 'Failed to stop price watch' });
  }
});

// GET /api/vendor/inventory/shortfall-check - Check for inventory shortfalls
router.get('/shortfall-check', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = shortfallCheckSchema.parse(req.query);

    const shortfalls = await checkInventoryShortfalls(vendorId, data);

    res.json(shortfalls);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error checking inventory shortfalls:', error);
    res.status(500).json({ error: 'Failed to check inventory shortfalls' });
  }
});

// Helper function to calculate seasonal forecasts
async function calculateSeasonalForecasts(vendorId: string) {
  try {
    // Get consumption data from movements over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const consumptionData = await prisma.inventoryMovement.findMany({
      where: {
        vendorProfileId: vendorId,
        type: 'CONSUME',
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      include: {
        inventoryItem: true
      }
    });

    // Group by month and item
    const monthlyConsumption: { [key: string]: { [itemId: string]: number } } = {};
    
    consumptionData.forEach(movement => {
      const month = movement.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyConsumption[month]) {
        monthlyConsumption[month] = {};
      }
      if (!monthlyConsumption[month][movement.inventoryItemId]) {
        monthlyConsumption[month][movement.inventoryItemId] = 0;
      }
      monthlyConsumption[month][movement.inventoryItemId] += Math.abs(Number(movement.qty));
    });

    // Calculate forecasts for next 8 weeks
    const forecasts = [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Simple moving average forecast (mock implementation)
    for (let i = 1; i <= 8; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + (i * 7));
      
      forecasts.push({
        week: i,
        date: forecastDate,
        items: Object.keys(monthlyConsumption[currentMonth] || {}).map(itemId => ({
          itemId,
          forecastedConsumption: Math.random() * 100, // Mock data
          recommendation: Math.random() > 0.5 ? 'PRE_BUY' : 'MAINTAIN'
        }))
      });
    }

    return forecasts;
  } catch (error) {
    logger.error('Error calculating seasonal forecasts:', error);
    return [];
  }
}

// Helper function to get upcoming commitments
async function getUpcomingCommitments(vendorId: string) {
  try {
    // Get upcoming sales windows
    const upcomingWindows = await prisma.salesWindow.findMany({
      where: {
        vendorId: vendorId,
        status: 'OPEN',
        fulfill_start_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Next 14 days
        }
      },
      include: {
        products: true
      }
    });

    // Get production plans
    const productionPlans = await prisma.productionPlan.findMany({
      where: {
        vendorProfileId: vendorId,
        status: 'PLANNED',
        planned_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const commitments = [];

    // Process sales windows
    upcomingWindows.forEach(window => {
      window.products.forEach((windowProduct: any) => {
        commitments.push({
          type: 'SALES_WINDOW',
          id: window.id,
          name: window.name,
          productName: `Product ${windowProduct.productId}`,
          materialName: 'Various materials',
          requiredQty: 1,
          unit: 'units',
          date: window.fulfill_start_at,
          status: 'UPCOMING'
        });
      });
    });

    // Process production plans
    productionPlans.forEach(plan => {
      commitments.push({
        type: 'PRODUCTION',
        id: plan.id,
        name: `Production Plan`,
        productName: `Product ${plan.productId}`,
        materialName: 'Various materials',
        requiredQty: plan.qty_to_make,
        unit: 'units',
        date: plan.planned_at,
        status: 'PLANNED'
      });
    });

    return commitments.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    logger.error('Error getting upcoming commitments:', error);
    return [];
  }
}

// Helper function to check inventory shortfalls
async function checkInventoryShortfalls(vendorId: string, params: any) {
  try {
    const shortfalls = [];

    if (params.productId) {
      // Check shortfall for specific product
      const product = await prisma.product.findFirst({
        where: {
          id: params.productId,
          vendorProfileId: vendorId
        },
        include: {
          materials: {
            include: {
              inventoryItem: true
            }
          }
        }
      });

      if (product && product.materials) {
        for (const material of product.materials) {
          const available = Number(material.inventoryItem.current_qty);
          const required = material.qty;
          
          if (available < required) {
            shortfalls.push({
              productId: product.id,
              productName: product.name,
              materialId: material.inventoryItem.id,
              materialName: material.inventoryItem.name,
              available,
              required,
              shortfall: required - available,
              unit: material.unit,
              priority: available <= 0 ? 'CRITICAL' : 'HIGH'
            });
          }
        }
      }
    }

    if (params.orderDraft) {
      // Check shortfall for order draft
      for (const item of params.orderDraft) {
        const product = await prisma.product.findFirst({
          where: {
            id: item.productId,
            vendorProfileId: vendorId
          },
          include: {
            materials: {
              include: {
                inventoryItem: true
              }
            }
          }
        });

        if (product && product.materials) {
          for (const material of product.materials) {
            const available = Number(material.inventoryItem.current_qty);
            const required = material.qty * item.qty;
            
            if (available < required) {
              shortfalls.push({
                productId: product.id,
                productName: product.name,
                materialId: material.inventoryItem.id,
                materialName: material.inventoryItem.name,
                available,
                required,
                shortfall: required - available,
                unit: material.unit,
                priority: available <= 0 ? 'CRITICAL' : 'HIGH'
              });
            }
          }
        }
      }
    }

    return shortfalls;
  } catch (error) {
    logger.error('Error checking inventory shortfalls:', error);
    return [];
  }
}

export default router;