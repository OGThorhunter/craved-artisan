import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';
import { callOllamaChat } from '../lib/ai';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const OrdersInsightsQuerySchema = z.object({
  range: z.string().default('7d'),
});

// AI Prompts
const PRIORITIZATION_SYSTEM_PROMPT = `
You are an order prioritization assistant. Analyze orders and provide smart prioritization recommendations.
Output JSON with rush orders, suggested stations, and ETAs.
`;

const BATCHING_SYSTEM_PROMPT = `
You are a production batching assistant. Analyze order items and suggest optimal batch sizes and timing.
Output JSON with product batches, start times, and stations.
`;

const SHORTAGE_SYSTEM_PROMPT = `
You are an inventory shortage detection assistant. Analyze orders against inventory levels.
Output JSON with shortages, needed quantities, and recommended actions.
`;

const PREP_PLAN_SYSTEM_PROMPT = `
You are a production planning assistant. Create step-by-step prep plans for orders.
Output JSON with prep steps, timing, and critical path analysis.
`;

// GET /api/ai/insights/orders
router.get('/orders', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { range } = OrdersInsightsQuerySchema.parse(req.query);

    // Calculate date range
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        vendorProfileId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'] },
        OR: [
          { createdAt: { gte: startDate, lte: endDate } },
          { dueAt: { gte: startDate, lte: endDate } },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                materials: {
                  include: {
                    inventoryItem: true,
                  },
                },
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueAt: 'asc' },
      ],
    });

    // Get inventory levels
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { vendorProfileId },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    // Analyze rush orders
    const rushOrders = await analyzeRushOrders(orders);
    
    // Analyze batching opportunities
    const batchingData = await analyzeBatching(orders);
    
    // Analyze inventory shortages
    const shortages = await analyzeShortages(orders, inventoryItems);
    
    // Generate prep plans
    const prepPlans = await generatePrepPlans(orders);

    res.json({
      rush: rushOrders,
      batching: batchingData,
      shortages,
      prepPlan: prepPlans,
      summary: {
        totalOrders: orders.length,
        rushCount: rushOrders.length,
        batchOpportunities: batchingData.length,
        shortageCount: shortages.length,
        dateRange: { start: startDate, end: endDate },
      },
    });

  } catch (error) {
    console.error('Get orders insights error:', error);
    res.status(500).json({ error: 'Failed to fetch orders insights' });
  }
});

// Helper function to analyze rush orders
async function analyzeRushOrders(orders: any[]): Promise<any[]> {
  const now = new Date();
  const rushOrders = [];

  for (const order of orders) {
    let rushScore = 0;
    const reasons = [];
    let suggestedStation = 'PREP';
    let etaMins = 60;

    // Calculate rush score based on various factors
    if (order.priority === 'RUSH') {
      rushScore += 40;
      reasons.push('High priority order');
    } else if (order.priority === 'HIGH') {
      rushScore += 25;
      reasons.push('High priority order');
    }

    // Check due time
    if (order.dueAt) {
      const timeToDue = new Date(order.dueAt).getTime() - now.getTime();
      const hoursToDue = timeToDue / (1000 * 60 * 60);
      
      if (hoursToDue < 1) {
        rushScore += 50;
        reasons.push('Due within 1 hour');
        suggestedStation = 'PACK';
        etaMins = 15;
      } else if (hoursToDue < 2) {
        rushScore += 30;
        reasons.push('Due within 2 hours');
        suggestedStation = 'COOK';
        etaMins = 30;
      } else if (hoursToDue < 4) {
        rushScore += 15;
        reasons.push('Due within 4 hours');
        suggestedStation = 'PREP';
        etaMins = 45;
      }
    }

    // Check order complexity
    const totalItems = order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    if (totalItems > 10) {
      rushScore += 10;
      reasons.push('Large order');
      etaMins += 30;
    }

    // Check if order is overdue
    if (order.dueAt && now > new Date(order.dueAt)) {
      rushScore += 60;
      reasons.push('Overdue');
      suggestedStation = 'PACK';
      etaMins = 10;
    }

    if (rushScore > 20) {
      rushOrders.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        reason: reasons.join(', '),
        suggestedStation,
        etaMins,
        rushScore,
        dueAt: order.dueAt,
        priority: order.priority,
        totalItems,
        totalValue: order.total,
      });
    }
  }

  // Sort by rush score
  rushOrders.sort((a, b) => b.rushScore - a.rushScore);

  return rushOrders;
}

// Helper function to analyze batching opportunities
async function analyzeBatching(orders: any[]): Promise<any[]> {
  const productGroups: Record<string, any> = {};

  // Group items by product
  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const key = `${item.productId}-${item.variantName || 'default'}`;
      
      if (!productGroups[key]) {
        productGroups[key] = {
          productId: item.productId,
          productName: item.productName,
          variantName: item.variantName,
          totalQty: 0,
          orders: [],
          optimalBatchSize: 12, // Default, could be configurable
        };
      }
      
      productGroups[key].totalQty += item.quantity;
      productGroups[key].orders.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        qty: item.quantity,
        dueAt: order.dueAt,
        priority: order.priority,
      });
    });
  });

  // Calculate optimal batches
  const batchingData = Object.values(productGroups)
    .filter((product: any) => product.totalQty > product.optimalBatchSize)
    .map((product: any) => {
      const batches = [];
      let remainingQty = product.totalQty;
      let batchNumber = 1;
      
      while (remainingQty > 0) {
        const batchQty = Math.min(remainingQty, product.optimalBatchSize);
        const batchStartTime = new Date(Date.now() + (batchNumber - 1) * 2 * 60 * 60 * 1000);
        
        batches.push({
          qty: batchQty,
          startAt: batchStartTime,
          station: 'PREP',
        });
        
        remainingQty -= batchQty;
        batchNumber++;
      }
      
      return {
        productId: product.productId,
        name: product.productName,
        totalQty: product.totalQty,
        optimalBatchSize: product.optimalBatchSize,
        batches,
      };
    });

  return batchingData;
}

// Helper function to analyze inventory shortages
async function analyzeShortages(orders: any[], inventoryItems: any[]): Promise<any[]> {
  const shortages = [];
  const inventoryMap = new Map(inventoryItems.map(item => [item.id, item]));

  for (const order of orders) {
    const orderShortages: any[] = [];
    
    order.orderItems.forEach((item: any) => {
      if (item.product.materials) {
        item.product.materials.forEach((material: any) => {
          const inventoryItem = inventoryMap.get(material.inventoryItemId);
          if (inventoryItem) {
            const needed = material.quantity_used * item.quantity;
            const available = inventoryItem.current_qty.toNumber();
            
            if (needed > available) {
              orderShortages.push({
                inventoryItemId: inventoryItem.id,
                name: inventoryItem.name,
                need: needed,
                have: available,
                delta: needed - available,
                unit: inventoryItem.unit,
              });
            }
          }
        });
      }
    });

    if (orderShortages.length > 0) {
      shortages.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: orderShortages,
        action: 'create restock',
        totalShortage: orderShortages.reduce((sum, item) => sum + item.delta, 0),
      });
    }
  }

  return shortages;
}

// Helper function to generate prep plans
async function generatePrepPlans(orders: any[]): Promise<any[]> {
  const prepPlans = [];

  for (const order of orders) {
    const steps = [];
    let criticalPathMins = 0;
    
    // Analyze each item in the order
    order.orderItems.forEach((item: any) => {
      // Estimate prep time based on item complexity
      let prepTime = 15; // Base prep time
      let cookTime = 30; // Base cook time
      const coolTime = 15; // Base cool time
      let packTime = 10; // Base pack time
      
      // Adjust based on quantity
      if (item.quantity > 5) {
        prepTime += (item.quantity - 5) * 2;
        cookTime += (item.quantity - 5) * 3;
        packTime += (item.quantity - 5) * 1;
      }
      
      // Add steps for this item
      steps.push({
        when: new Date(Date.now() + criticalPathMins * 60 * 1000),
        station: 'PREP',
        action: `Prep ${item.productName} (${item.quantity} units)`,
        duration: prepTime,
        itemId: item.id,
      });
      
      criticalPathMins += prepTime;
      
      steps.push({
        when: new Date(Date.now() + criticalPathMins * 60 * 1000),
        station: 'COOK',
        action: `Cook ${item.productName}`,
        duration: cookTime,
        itemId: item.id,
      });
      
      criticalPathMins += cookTime;
      
      steps.push({
        when: new Date(Date.now() + criticalPathMins * 60 * 1000),
        station: 'COOL',
        action: `Cool ${item.productName}`,
        duration: coolTime,
        itemId: item.id,
      });
      
      criticalPathMins += coolTime;
      
      steps.push({
        when: new Date(Date.now() + criticalPathMins * 60 * 1000),
        station: 'PACK',
        action: `Pack ${item.productName}`,
        duration: packTime,
        itemId: item.id,
      });
      
      criticalPathMins += packTime;
    });
    
    // Sort steps by time
    steps.sort((a, b) => a.when.getTime() - b.when.getTime());
    
    prepPlans.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      steps,
      criticalPathMins,
      estimatedCompletion: new Date(Date.now() + criticalPathMins * 60 * 1000),
    });
  }

  // Sort by critical path time
  prepPlans.sort((a, b) => a.criticalPathMins - b.criticalPathMins);

  return prepPlans;
}

export default router;
