import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireVendorAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const RecipeParseSchema = z.object({
  sourceType: z.enum(['IMAGE', 'PDF', 'TEXT', 'URL']),
  sourceUrl: z.string().url().optional(),
  rawText: z.string().optional(),
});

const ApplyPriceSchema = z.object({
  productId: z.string(),
  newPrice: z.number().positive(),
  reason: z.string().optional(),
});

// POST /api/vendor/ai/recipe-parser - Parse recipe from various sources
router.post('/recipe-parser', requireVendorAuth, validateRequest(RecipeParseSchema), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { sourceType, sourceUrl, rawText } = req.body as z.infer<typeof RecipeParseSchema>;

    // Create parse job
    const job = await prisma.recipeParseJob.create({
      data: {
        vendorProfileId: vendorId,
        sourceType,
        sourceUrl,
        rawText,
        status: 'PENDING',
      },
    });

    // TODO: Implement actual AI parsing logic
    // For now, simulate parsing with mock data
    setTimeout(async () => {
      try {
        const mockParsedData = {
          productName: 'Sample Recipe Product',
          description: 'A delicious recipe parsed from the provided source',
          ingredients: [
            { name: 'Flour', qty: 2, unit: 'cups' },
            { name: 'Sugar', qty: 1, unit: 'cup' },
            { name: 'Eggs', qty: 2, unit: 'each' },
          ],
          instructions: 'Mix ingredients and bake at 350°F for 30 minutes',
          estimatedYield: 12,
          yieldUnit: 'servings',
          suggestedCategory: 'Baked Goods',
          suggestedTags: ['dessert', 'baking'],
        };

        await prisma.recipeParseJob.update({
          where: { id: job.id },
          data: {
            status: 'DONE',
            parsedJson: mockParsedData,
          },
        });
      } catch (error) {
        console.error('Error in recipe parsing:', error);
        await prisma.recipeParseJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
          },
        });
      }
    }, 2000); // Simulate 2-second processing time

    res.status(202).json({ jobId: job.id });
  } catch (error) {
    console.error('Error creating recipe parse job:', error);
    res.status(500).json({ error: 'Failed to create recipe parse job' });
  }
});

// GET /api/vendor/ai/recipe-parser/:jobId - Get parse job status and results
router.get('/recipe-parser/:jobId', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { jobId } = req.params;

    const job = await prisma.recipeParseJob.findFirst({
      where: { id: jobId, vendorProfileId: vendorId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Parse job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching recipe parse job:', error);
    res.status(500).json({ error: 'Failed to fetch parse job' });
  }
});

// GET /api/vendor/ai/pricing-insights - Get AI pricing recommendations
router.get('/pricing-insights', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { filter = 'all' } = req.query;

    // Get products with pricing data
    const products = await prisma.product.findMany({
      where: { vendorProfileId: vendorId, active: true },
      include: {
        competitorPrices: {
          orderBy: { capturedAt: 'desc' },
          take: 3,
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        materials: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // Generate AI insights (mock implementation)
    const insights = products.map((product) => {
      const materialsCost = product.materials.reduce((total, material) => {
        return total + (material.inventoryItem.avgCost || 0) * material.qty;
      }, 0);

      const totalCost = product.baseCost + product.laborCost + materialsCost;
      const currentMargin = ((product.price - totalCost) / product.price) * 100;

      // Simple AI logic for pricing recommendations
      let recommendation = 'maintain';
      let recommendedPrice = product.price;
      let confidence = 0.7;
      let reasoning = '';

      if (currentMargin < product.targetMarginLowPct) {
        recommendation = 'increase';
        recommendedPrice = totalCost / (1 - product.targetMarginLowPct / 100);
        confidence = 0.9;
        reasoning = `Current margin (${currentMargin.toFixed(1)}%) is below target (${product.targetMarginLowPct}%)`;
      } else if (currentMargin > product.targetMarginHighPct) {
        recommendation = 'decrease';
        recommendedPrice = totalCost / (1 - product.targetMarginHighPct / 100);
        confidence = 0.8;
        reasoning = `Current margin (${currentMargin.toFixed(1)}%) is above target (${product.targetMarginHighPct}%)`;
      } else {
        reasoning = `Margin (${currentMargin.toFixed(1)}%) is within target range`;
      }

      // Check competitor pricing
      if (product.competitorPrices.length > 0) {
        const avgCompetitorPrice = product.competitorPrices.reduce(
          (sum, cp) => sum + cp.price, 0
        ) / product.competitorPrices.length;

        if (product.price > avgCompetitorPrice * 1.2) {
          recommendation = 'decrease';
          recommendedPrice = avgCompetitorPrice * 1.1;
          confidence = 0.85;
          reasoning += `. Competitor average: $${avgCompetitorPrice.toFixed(2)}`;
        } else if (product.price < avgCompetitorPrice * 0.8) {
          recommendation = 'increase';
          recommendedPrice = avgCompetitorPrice * 0.9;
          confidence = 0.8;
          reasoning += `. Competitor average: $${avgCompetitorPrice.toFixed(2)}`;
        }
      }

      return {
        productId: product.id,
        productName: product.name,
        currentPrice: product.price,
        recommendedPrice: Math.round(recommendedPrice * 100) / 100,
        recommendation,
        confidence,
        reasoning,
        currentMargin: Math.round(currentMargin * 10) / 10,
        projectedMargin: Math.round(((recommendedPrice - totalCost) / recommendedPrice) * 100 * 10) / 10,
        imageUrl: product.imageUrl,
        type: product.type,
      };
    });

    // Filter insights based on request
    let filteredInsights = insights;
    if (filter === 'increase') {
      filteredInsights = insights.filter(i => i.recommendation === 'increase');
    } else if (filter === 'decrease') {
      filteredInsights = insights.filter(i => i.recommendation === 'decrease');
    } else if (filter === 'watchlist') {
      filteredInsights = insights.filter(i => i.confidence > 0.8);
    }

    res.json({ insights: filteredInsights });
  } catch (error) {
    console.error('Error generating pricing insights:', error);
    res.status(500).json({ error: 'Failed to generate pricing insights' });
  }
});

// POST /api/vendor/ai/apply-price - Apply AI-recommended price
router.post('/apply-price', requireVendorAuth, validateRequest(ApplyPriceSchema), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { productId, newPrice, reason } = req.body as z.infer<typeof ApplyPriceSchema>;

    // Get current product
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorProfileId: vendorId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const oldPrice = product.price;

    // Update product price
    const updatedProduct = await prisma.product.update({
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
        reason: reason || 'AI pricing recommendation applied',
      },
    });

    res.json({
      product: updatedProduct,
      priceChange: {
        oldPrice,
        newPrice,
        change: newPrice - oldPrice,
        changePct: ((newPrice - oldPrice) / oldPrice) * 100,
      },
    });
  } catch (error) {
    console.error('Error applying price:', error);
    res.status(500).json({ error: 'Failed to apply price' });
  }
});

// GET /api/vendor/unit-convert - Convert between units
router.get('/unit-convert', requireVendorAuth, async (req, res) => {
  try {
    const { from, to, materialId } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to units are required' });
    }

    // Get material density if materialId provided
    let density = null;
    if (materialId) {
      const material = await prisma.inventoryItem.findFirst({
        where: { id: materialId as string },
      });
      // TODO: Add density field to InventoryItem model
      // density = material?.density;
    }

    // Unit conversion factors (simplified)
    const conversionFactors: Record<string, Record<string, number>> = {
      // Volume to Volume
      'cups': { 'ml': 236.588, 'tbsp': 16, 'tsp': 48, 'fl-oz': 8 },
      'tbsp': { 'ml': 14.7868, 'tsp': 3, 'cups': 0.0625 },
      'tsp': { 'ml': 4.92892, 'tbsp': 0.333333, 'cups': 0.0208333 },
      'ml': { 'cups': 0.00422675, 'tbsp': 0.067628, 'tsp': 0.202884 },
      'fl-oz': { 'ml': 29.5735, 'cups': 0.125 },
      
      // Weight to Weight
      'lbs': { 'kg': 0.453592, 'oz': 16, 'g': 453.592 },
      'kg': { 'lbs': 2.20462, 'g': 1000 },
      'oz': { 'lbs': 0.0625, 'g': 28.3495 },
      'g': { 'kg': 0.001, 'lbs': 0.00220462, 'oz': 0.035274 },
      
      // Common baking conversions (approximate)
      'cups-flour': { 'g': 125, 'oz': 4.4 },
      'cups-sugar': { 'g': 200, 'oz': 7.1 },
      'cups-butter': { 'g': 227, 'oz': 8 },
    };

    const factor = conversionFactors[from as string]?.[to as string];
    
    if (!factor) {
      return res.status(400).json({ 
        error: 'Conversion not supported',
        availableConversions: Object.keys(conversionFactors)
      });
    }

    res.json({
      from,
      to,
      factor,
      isApproximate: !density, // Would be more accurate with density data
      note: density ? 'Exact conversion using material density' : 'Approximate conversion - consider material density for accuracy'
    });
  } catch (error) {
    console.error('Error converting units:', error);
    res.status(500).json({ error: 'Failed to convert units' });
  }
});

export default router;




















