import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { logger } from '../logger';
import { createInventorySystemMessage } from './system-messages.router';

const router = Router();

// Validation schemas
const shortfallCheckSchema = z.object({
  productId: z.string().optional(),
  windowId: z.string().optional(),
  orderDraft: z.array(z.object({
    productId: z.string(),
    qty: z.number().positive()
  })).optional(),
  timeWindowDays: z.number().default(14),
});

const consumeInventorySchema = z.object({
  productId: z.string(),
  qty: z.number().positive(),
  refType: z.string().default('ORDER'),
  refId: z.string().optional(),
  notes: z.string().optional(),
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

// POST /api/vendor/inventory/consume-for-order - Consume inventory for order
router.post('/consume-for-order', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = consumeInventorySchema.parse(req.body);

    // Get product with materials
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
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

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.materials || product.materials.length === 0) {
      return res.status(400).json({ error: 'Product has no materials defined' });
    }

    // Check for shortfalls first
    const shortfalls = [];
    for (const material of product.materials) {
      const available = Number(material.inventoryItem.current_qty);
      const required = material.qty * data.qty;
      
      if (available < required) {
        shortfalls.push({
          materialId: material.inventoryItem.id,
          materialName: material.inventoryItem.name,
          available,
          required,
          shortfall: required - available,
          unit: material.unit
        });
      }
    }

    if (shortfalls.length > 0) {
      return res.status(400).json({
        error: 'Insufficient inventory',
        shortfalls
      });
    }

    // Consume inventory
    const movements = [];
    for (const material of product.materials) {
      const qtyToConsume = material.qty * data.qty;
      
      const movement = await prisma.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: material.inventoryItem.id,
          type: 'CONSUME',
          qty: -qtyToConsume,
          refType: data.refType,
          refId: data.refId,
          notes: data.notes || `Consumed for product: ${product.name}`
        }
      });

      // Update inventory quantity
      await prisma.inventoryItem.update({
        where: { id: material.inventoryItem.id },
        data: {
          current_qty: Number(material.inventoryItem.current_qty) - qtyToConsume
        }
      });

      movements.push(movement);
    }

    res.json({
      message: 'Inventory consumed successfully',
      movements,
      consumedItems: product.materials.map(material => ({
        materialId: material.inventoryItem.id,
        materialName: material.inventoryItem.name,
        qtyConsumed: material.qty * data.qty,
        unit: material.unit
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error consuming inventory for order:', error);
    res.status(500).json({ error: 'Failed to consume inventory' });
  }
});

// POST /api/vendor/inventory/consume-for-production - Consume inventory for production
router.post('/consume-for-production', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor profile required' });
    }

    const data = consumeInventorySchema.parse(req.body);

    // Get product with materials
    const product = await prisma.product.findFirst({
      where: {
        id: data.productId,
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

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.materials || product.materials.length === 0) {
      return res.status(400).json({ error: 'Product has no materials defined' });
    }

    // Check for shortfalls first
    const shortfalls = [];
    for (const material of product.materials) {
      const available = Number(material.inventoryItem.current_qty);
      const required = material.qty * data.qty;
      
      if (available < required) {
        shortfalls.push({
          materialId: material.inventoryItem.id,
          materialName: material.inventoryItem.name,
          available,
          required,
          shortfall: required - available,
          unit: material.unit
        });
      }
    }

    if (shortfalls.length > 0) {
      return res.status(400).json({
        error: 'Insufficient inventory',
        shortfalls
      });
    }

    // Consume inventory
    const movements = [];
    for (const material of product.materials) {
      const qtyToConsume = material.qty * data.qty;
      
      const movement = await prisma.inventoryMovement.create({
        data: {
          vendorProfileId: vendorId,
          inventoryItemId: material.inventoryItem.id,
          type: 'CONSUME',
          qty: -qtyToConsume,
          refType: 'PRODUCTION',
          refId: data.refId,
          notes: data.notes || `Consumed for production: ${product.name}`
        }
      });

      // Update inventory quantity
      await prisma.inventoryItem.update({
        where: { id: material.inventoryItem.id },
        data: {
          current_qty: Number(material.inventoryItem.current_qty) - qtyToConsume
        }
      });

      movements.push(movement);
    }

    res.json({
      message: 'Inventory consumed successfully',
      movements,
      consumedItems: product.materials.map(material => ({
        materialId: material.inventoryItem.id,
        materialName: material.inventoryItem.name,
        qtyConsumed: material.qty * data.qty,
        unit: material.unit
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error consuming inventory for production:', error);
    res.status(500).json({ error: 'Failed to consume inventory' });
  }
});

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

    if (params.windowId) {
      // Check shortfall for sales window
      const window = await prisma.salesWindow.findFirst({
        where: {
          id: params.windowId,
          vendorId: vendorId
        },
        include: {
          products: true
        }
      });

      if (window && window.products) {
        for (const windowProduct of window.products) {
          // Simplified check for sales window products
          shortfalls.push({
            windowId: window.id,
            windowName: window.name,
            productId: windowProduct.productId,
            productName: `Product ${windowProduct.productId}`,
            materialId: 'unknown',
            materialName: 'Various materials',
            available: 0,
            required: 1,
            shortfall: 1,
            unit: 'units',
            priority: 'HIGH'
          });
        }
      }
    }

    // Create system messages for critical shortfalls
    for (const shortfall of shortfalls) {
      if (shortfall.priority === 'CRITICAL') {
        await createInventorySystemMessage(
          vendorId,
          'shortfall',
          'Critical Inventory Shortfall',
          `${shortfall.materialName} is out of stock but required for ${shortfall.productName || 'production'}.`,
          {
            shortfall,
            route: '/inventory'
          }
        );
      }
    }

    return shortfalls;
  } catch (error) {
    logger.error('Error checking inventory shortfalls:', error);
    return [];
  }
}

export default router;