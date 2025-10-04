import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const ApplyPriceSchema = z.object({
  productId: z.string(),
  newPrice: z.number().positive(),
  rationale: z.string().optional(),
});

const CreatePOSchema = z.object({
  lines: z.array(z.object({
    inventoryItemId: z.string(),
    qty: z.number().positive(),
    unit_cost_est: z.number().positive(),
    supplier_name: z.string(),
  })),
});

const CompetitorImportSchema = z.object({
  data: z.array(z.object({
    productSku: z.string(),
    competitor: z.string(),
    price: z.number().positive(),
    url: z.string().url().optional(),
    date: z.string().optional(),
  })),
});

// AI Pricing Insights Endpoint
router.get('/pricing-insights', async (req: Request, res: Response) => {
  try {
    const { range = '30d' } = req.query;
    const vendorId = req.session?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate date range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get products with recent sales data
    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorId,
        isAvailable: true,
      },
      include: {
        competitorPrices: {
          where: {
            capturedAt: {
              gte: startDate,
            },
          },
          orderBy: {
            capturedAt: 'desc',
          },
        },
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: startDate,
              },
            },
          },
          include: {
            order: true,
          },
        },
      },
    });

    // Generate AI insights for each product
    const insights = products.map(product => {
      const sales30d = product.orderItems.length;
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const avgOrderValue = sales30d > 0 ? totalRevenue / sales30d : 0;

      // Calculate competitor metrics
      const competitorPrices = product.competitorPrices.map(cp => cp.price);
      const competitorMedian = competitorPrices.length > 0 
        ? competitorPrices.sort((a, b) => a - b)[Math.floor(competitorPrices.length / 2)]
        : null;
      const competitorRange = competitorPrices.length > 0 
        ? { min: Math.min(...competitorPrices), max: Math.max(...competitorPrices) }
        : null;

      // Calculate current margin
      const baseCost = product.baseCost || product.cost || 0;
      const feesEst = calculateFeesEstimate(product.price);
      const marginPct = baseCost > 0 ? ((product.price - baseCost - feesEst) / product.price) * 100 : 0;

      // AI Rules Engine
      const { recPrice, confidencePct, rationale, actions } = generatePricingInsight({
        currentPrice: product.price,
        baseCost,
        feesEst,
        marginPct,
        sales30d,
        competitorMedian,
        competitorRange,
        targetMarginLow: product.targetMarginLowPct || 30,
        targetMarginHigh: product.targetMarginHighPct || 50,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
      });

      return {
        productId: product.id,
        productName: product.name,
        currentPrice: product.price,
        baseCost,
        feesEst,
        marginPct,
        sales_30d: sales30d,
        competitorMedian,
        competitorRange,
        recPrice,
        confidencePct,
        rationale,
        actions,
      };
    });

    // Filter out products with no insights or low confidence
    const filteredInsights = insights.filter(insight => insight.confidencePct > 50);

    res.json(filteredInsights);

  } catch (error) {
    console.error('Error fetching pricing insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply Price Endpoint
router.post('/apply-price', async (req: Request, res: Response) => {
  try {
    const { productId, newPrice, rationale } = ApplyPriceSchema.parse(req.body);
    const vendorId = req.session?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorProfileId: vendorId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldPrice = product.price;

    // Update product price
    await prisma.product.update({
      where: { id: productId },
      data: { price: newPrice },
    });

    // Record price history
    await prisma.productPriceHistory.create({
      data: {
        vendorProfileId: vendorId,
        productId,
        oldPrice,
        newPrice,
        changedBy: 'ai_suggest',
        reason: rationale || 'AI suggested price adjustment',
      },
    });

    res.json({ success: true, message: 'Price updated successfully' });

  } catch (error) {
    console.error('Error applying price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Inventory Insights Endpoint
router.get('/inventory-insights', async (req: Request, res: Response) => {
  try {
    const { horizon = '30d' } = req.query;
    const vendorId = req.session?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate horizon days
    const days = horizon === '7d' ? 7 : horizon === '30d' ? 30 : 90;

    // Get inventory items with usage data
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: {
        vendorProfileId: vendorId,
      },
      include: {
        supplierOffers: {
          where: {
            validFrom: {
              lte: new Date(),
            },
            validTo: {
              gte: new Date(),
            },
          },
          orderBy: {
            unitCost: 'asc',
          },
        },
      },
    });

    // Generate inventory insights
    const insights = inventoryItems.map(item => {
      // Calculate daily run rate (simplified - would need actual usage data)
      const dailyRunRate = item.currentQty > 0 ? Math.max(0.1, item.currentQty / 30) : 0.1;
      
      // Calculate stockout risk
      const stockoutRiskPct = Math.max(0, Math.min(100, 
        (1 - (item.currentQty / (item.leadTimeDays * dailyRunRate))) * 100
      ));

      // Get best offer
      const bestOffer = item.supplierOffers[0] || null;
      const savingsVsLastCostPct = bestOffer && item.lastCost 
        ? ((item.lastCost - bestOffer.unitCost) / item.lastCost) * 100
        : 0;

      // Calculate recommended order quantity
      const recOrderQty = Math.max(0, 
        (item.leadTimeDays * dailyRunRate * 1.5) - item.currentQty
      );

      // Generate rationale
      const rationale = [];
      if (stockoutRiskPct > 70) {
        rationale.push('High stockout risk');
      }
      if (bestOffer && savingsVsLastCostPct > 10) {
        rationale.push('Significant cost savings available');
      }
      if (item.currentQty <= item.reorderPoint) {
        rationale.push('Below reorder point');
      }

      // Determine confidence
      let confidencePct = 60;
      if (item.currentQty > 0) confidencePct += 10;
      if (bestOffer) confidencePct += 10;
      if (item.leadTimeDays > 0) confidencePct += 10;
      if (stockoutRiskPct > 50) confidencePct += 10;

      return {
        inventoryItemId: item.id,
        name: item.name,
        currentQty: item.currentQty,
        reorderPoint: item.reorderPoint,
        leadTimeDays: item.leadTimeDays,
        dailyRunRate,
        stockoutRiskPct,
        recOrderQty: Math.round(recOrderQty),
        bestOffer: bestOffer ? {
          supplier: bestOffer.supplierName,
          unitCost: bestOffer.unitCost,
          pack: bestOffer.packSize,
          bulkBreak: bestOffer.bulkBreakQty,
          bulkUnitCost: bestOffer.bulkUnitCost,
        } : null,
        savingsVsLastCostPct,
        confidencePct,
        rationale,
        actions: {
          createPO: recOrderQty > 0 && confidencePct > 60,
        },
      };
    });

    // Filter insights by confidence and risk
    const filteredInsights = insights.filter(insight => 
      insight.confidencePct > 50 || insight.stockoutRiskPct > 30
    );

    res.json(filteredInsights);

  } catch (error) {
    console.error('Error fetching inventory insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Purchase Order Endpoint
router.post('/create-po', async (req: Request, res: Response) => {
  try {
    const { lines } = CreatePOSchema.parse(req.body);
    const vendorId = req.session?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate total cost
    const totalEstimatedCost = lines.reduce((sum, line) => 
      sum + (line.qty * line.unit_cost_est), 0
    );

    // Create purchase order
    const purchaseOrder = await prisma.inventoryPurchaseOrder.create({
      data: {
        vendorProfileId: vendorId,
        status: 'draft',
        totalEstimatedCost,
      },
    });

    // Create purchase order lines
    const orderLines = await Promise.all(
      lines.map(line =>
        prisma.inventoryPurchaseOrderLine.create({
          data: {
            purchaseOrderId: purchaseOrder.id,
            inventoryItemId: line.inventoryItemId,
            qty: line.qty,
            unitCostEst: line.unit_cost_est,
          },
        })
      )
    );

    res.json({
      success: true,
      purchaseOrderId: purchaseOrder.id,
      totalCost: totalEstimatedCost,
      lineCount: orderLines.length,
    });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Competitor Data Import Endpoint
router.post('/competitors/import', async (req: Request, res: Response) => {
  try {
    const { data } = CompetitorImportSchema.parse(req.body);
    const vendorId = req.session?.vendorProfileId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Import competitor data
    const importedData = await Promise.all(
      data.map(async (item) => {
        // Find product by SKU
        const product = await prisma.product.findFirst({
          where: {
            vendorProfileId: vendorId,
            // Assuming SKU is stored in tags or we need to add a sku field
            tags: {
              contains: item.productSku,
            },
          },
        });

        if (!product) {
          return { error: `Product with SKU ${item.productSku} not found` };
        }

        return prisma.productCompetitorPrice.create({
          data: {
            vendorProfileId: vendorId,
            productId: product.id,
            competitorName: item.competitor,
            price: item.price,
            sourceUrl: item.url,
            capturedAt: item.date ? new Date(item.date) : new Date(),
          },
        });
      })
    );

    const successCount = importedData.filter(item => !item.error).length;
    const errorCount = importedData.filter(item => item.error).length;

    res.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      details: importedData,
    });

  } catch (error) {
    console.error('Error importing competitor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper Functions

function calculateFeesEstimate(price: number): number {
  // Platform fee (3%) + payment processing (2.9% + $0.30)
  const platformFee = price * 0.03;
  const paymentFee = (price * 0.029) + 0.30;
  return platformFee + paymentFee;
}

function generatePricingInsight({
  currentPrice,
  baseCost,
  feesEst,
  marginPct,
  sales30d,
  competitorMedian,
  competitorRange,
  targetMarginLow,
  targetMarginHigh,
  minPrice,
  maxPrice,
}: {
  currentPrice: number;
  baseCost: number;
  feesEst: number;
  marginPct: number;
  sales30d: number;
  competitorMedian: number | null;
  competitorRange: { min: number; max: number } | null;
  targetMarginLow: number;
  targetMarginHigh: number;
  minPrice: number | null;
  maxPrice: number | null;
}) {
  const rationale: string[] = [];
  let recPrice = currentPrice;
  let confidencePct = 60;

  // Rule 1: Margin below target and competitors higher
  if (marginPct < targetMarginLow && competitorMedian && competitorMedian > currentPrice) {
    const suggestedPrice = Math.min(
      currentPrice * 1.1, // Max 10% increase
      maxPrice || currentPrice * 1.2,
      competitorRange?.max || currentPrice * 1.2
    );
    recPrice = suggestedPrice;
    rationale.push('Margin below target range');
    rationale.push('Competitors pricing higher');
    confidencePct += 15;
  }

  // Rule 2: Low sales and competitors much lower
  if (sales30d < 5 && competitorMedian && competitorMedian < currentPrice * 0.8) {
    const suggestedPrice = Math.max(
      currentPrice * 0.9, // Max 10% decrease
      minPrice || baseCost + feesEst + (baseCost * targetMarginLow / 100),
      competitorRange?.min || baseCost + feesEst
    );
    recPrice = suggestedPrice;
    rationale.push('Low sales volume');
    rationale.push('Competitors pricing significantly lower');
    confidencePct += 10;
  }

  // Rule 3: High margin but good sales - maintain or slight increase
  if (marginPct > targetMarginHigh && sales30d > 10) {
    if (competitorMedian && competitorMedian > currentPrice) {
      const suggestedPrice = Math.min(currentPrice * 1.05, competitorMedian);
      recPrice = suggestedPrice;
      rationale.push('High margin with good sales');
      rationale.push('Room for price increase');
      confidencePct += 10;
    }
  }

  // Adjust confidence based on data quality
  if (sales30d >= 50) confidencePct += 10;
  if (competitorMedian && competitorRange) confidencePct += 10;
  if (!competitorMedian) confidencePct -= 10;

  // Determine actions
  const actions = {
    applyPrice: Math.abs(recPrice - currentPrice) / currentPrice > 0.05, // 5% change threshold
    floorWarning: recPrice <= (baseCost + feesEst) * 1.1,
    inventoryNote: sales30d === 0 ? 'No recent sales - check inventory' : undefined,
  };

  return {
    recPrice: Math.round(recPrice * 100) / 100, // Round to 2 decimal places
    confidencePct: Math.min(95, Math.max(30, confidencePct)),
    rationale,
    actions,
  };
}

export default router;



