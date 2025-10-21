import express from 'express';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { 
  forecastSeries, 
  detectAnomalies, 
  analyzeSeasonality, 
  analyzeDemandPatterns,
  callOllamaChat,
  generatePricingAdvice,
  PRICING_ADVICE_PROMPT
} from '../lib/ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Validation schemas
const InsightsQuerySchema = z.object({
  range: z.string().default('30d'),
});

// GET /api/ai/insights/inventory
router.get('/inventory', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;

    // Get all inventory items
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { vendorProfileId },
      include: {
        movements: {
          where: {
            type: 'CONSUME',
            createdAt: {
              gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Get upcoming orders and production plans
    const upcomingOrders = await prisma.order.findMany({
      where: {
        vendorProfileId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        fulfillmentDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Next 14 days
        },
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
      },
    });

    // Calculate restock alerts
    const restockAlerts = inventoryItems
      .filter(item => Number(item.current_qty) <= Number(item.reorder_point))
      .map(item => ({
        inventoryItemId: item.id,
        name: item.name,
        current_qty: Number(item.current_qty),
        reorder_point: Number(item.reorder_point),
        preferred_qty: Number(item.preferred_qty),
        suggested_qty: Number(item.preferred_qty) - Number(item.current_qty),
        unit: item.unit,
        avg_cost: Number(item.avg_cost),
      }));

    // Calculate shortfall alerts
    const shortfallAlerts = [];
    const itemNeeds = new Map<string, number>();

    // Aggregate needs from upcoming orders
    for (const order of upcomingOrders) {
      for (const orderItem of order.orderItems) {
        for (const material of orderItem.product.materials) {
          const need = Number(orderItem.quantity) * Number(material.quantity);
          const current = itemNeeds.get(material.inventoryItemId) || 0;
          itemNeeds.set(material.inventoryItemId, current + need);
        }
      }
    }

    // Check for shortfalls
    for (const [inventoryItemId, need] of itemNeeds) {
      const item = inventoryItems.find(i => i.id === inventoryItemId);
      if (item && Number(item.current_qty) < need) {
        shortfallAlerts.push({
          inventoryItemId: item.id,
          name: item.name,
          current_qty: Number(item.current_qty),
          needed_qty: need,
          shortfall: need - Number(item.current_qty),
          unit: item.unit,
          urgency: need > Number(item.current_qty) * 2 ? 'high' : 'medium',
        });
      }
    }

    // Calculate seasonal forecasts
    const seasonalForecasts = [];
    for (const item of inventoryItems) {
      if (item.movements.length >= 30) { // Need at least 30 days of data
        try {
          // Prepare data for forecasting
          const consumptionData = item.movements.map(movement => ({
            date: movement.createdAt.toISOString().split('T')[0],
            consumed: Number(movement.quantity),
          }));

          // Get forecast
          const forecast = await forecastSeries(consumptionData, 56); // 8 weeks
          
          // Calculate next 8 weeks total
          const next8WeeksTotal = forecast.forecast
            .slice(0, 56)
            .reduce((sum, point) => sum + point.predicted, 0);

          // Calculate baseline (last 8 weeks)
          const last8WeeksTotal = consumptionData
            .slice(-56)
            .reduce((sum, point) => sum + point.consumed, 0);

          const increase = next8WeeksTotal - last8WeeksTotal;
          const increasePercent = last8WeeksTotal > 0 ? (increase / last8WeeksTotal) * 100 : 0;

          if (increasePercent > 20) { // Significant increase
            seasonalForecasts.push({
              inventoryItemId: item.id,
              name: item.name,
              current_qty: Number(item.current_qty),
              forecast_8weeks: next8WeeksTotal,
              baseline_8weeks: last8WeeksTotal,
              increase_percent: increasePercent,
              trend: forecast.trend,
              recommendation: increasePercent > 50 ? 'Pre-buy now' : 'Monitor closely',
            });
          }
        } catch (error) {
          console.warn(`Forecast failed for item ${item.id}:`, error);
        }
      }
    }

    // Get price watch hits (stub for now)
    const priceWatchHits = [];

    // Create system messages for critical alerts
    const criticalAlerts = [
      ...restockAlerts.filter(alert => alert.suggested_qty > 100),
      ...shortfallAlerts.filter(alert => alert.urgency === 'high'),
    ];

    for (const alert of criticalAlerts) {
      await prisma.systemMessage.create({
        data: {
          vendorProfileId,
          scope: 'inventory',
          type: alert.suggested_qty ? 'restock_alert' : 'shortfall',
          title: alert.suggested_qty ? 'Critical Restock Alert' : 'Critical Shortfall Alert',
          body: alert.suggested_qty 
            ? `${alert.name} is critically low. Suggested reorder: ${alert.suggested_qty} ${alert.unit}`
            : `${alert.name} has a critical shortfall. Need ${alert.shortfall} ${alert.unit} for upcoming orders`,
          data: JSON.stringify({ alert }),
        },
      });
    }

    res.json({
      restock: restockAlerts,
      shortfall: shortfallAlerts,
      seasonal: seasonalForecasts,
      priceWatches: priceWatchHits,
      summary: {
        total_items: inventoryItems.length,
        restock_alerts: restockAlerts.length,
        shortfall_alerts: shortfallAlerts.length,
        seasonal_forecasts: seasonalForecasts.length,
        critical_alerts: criticalAlerts.length,
      },
    });

  } catch (error) {
    console.error('Inventory insights error:', error);
    res.status(500).json({ error: 'Failed to generate inventory insights' });
  }
});

// GET /api/ai/insights/pricing
router.get('/pricing', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { range } = InsightsQuerySchema.parse(req.query);

    // Calculate date range
    const days = range === '30d' ? 30 : range === '7d' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get products with sales data
    const products = await prisma.product.findMany({
      where: { vendorProfileId, active: true },
      include: {
        orderItems: {
          where: {
            order: {
              status: 'COMPLETED',
              createdAt: { gte: startDate },
            },
          },
        },
        competitorPrices: {
          where: {
            createdAt: { gte: startDate },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const pricingInsights = [];

    for (const product of products) {
      // Calculate sales in period
      const sales30d = product.orderItems.reduce((sum, item) => sum + Number(item.quantity), 0);
      
      // Calculate current margin
      const totalCost = Number(product.baseCost) + Number(product.laborCost);
      const marginPct = product.price > 0 ? ((product.price - totalCost) / product.price) * 100 : 0;
      
      // Get competitor median
      const competitorMedian = product.competitorPrices[0]?.price || null;
      
      // Generate pricing advice
      let advice = '';
      let suggestion = null;
      
      try {
        const advicePrompt = generatePricingAdvice(
          product.name,
          product.price,
          totalCost,
          marginPct,
          product.targetMarginLowPct,
          product.targetMarginHighPct,
          competitorMedian,
          sales30d
        );

        advice = await callOllamaChat({
          system: PRICING_ADVICE_PROMPT,
          prompt: advicePrompt,
        });

        // Determine if we should suggest a price change
        if (marginPct < product.targetMarginLowPct && competitorMedian && product.price < competitorMedian) {
          suggestion = {
            type: 'increase',
            current_price: product.price,
            suggested_price: Math.min(product.price * 1.1, competitorMedian * 0.95),
            reason: 'Low margin with competitive opportunity',
          };
        } else if (sales30d < 5 && competitorMedian && product.price > competitorMedian * 1.2) {
          suggestion = {
            type: 'decrease',
            current_price: product.price,
            suggested_price: Math.max(product.price * 0.9, competitorMedian * 1.05),
            reason: 'Low sales with high price vs competitors',
          };
        }
      } catch (error) {
        console.warn(`Pricing advice failed for product ${product.id}:`, error);
        advice = 'Unable to generate pricing advice at this time.';
      }

      pricingInsights.push({
        productId: product.id,
        name: product.name,
        current_price: product.price,
        base_cost: Number(product.baseCost),
        labor_cost: Number(product.laborCost),
        total_cost: totalCost,
        margin_pct: marginPct,
        target_margin_low: product.targetMarginLowPct,
        target_margin_high: product.targetMarginHighPct,
        competitor_median: competitorMedian,
        sales_30d: sales30d,
        advice,
        suggestion,
      });

      // Create system message for significant suggestions
      if (suggestion && Math.abs(suggestion.suggested_price - suggestion.current_price) / suggestion.current_price > 0.05) {
        await prisma.systemMessage.create({
          data: {
            vendorProfileId,
            scope: 'pricing',
            type: 'pricing_advice',
            title: `Pricing Suggestion: ${product.name}`,
            body: `${suggestion.type === 'increase' ? 'Consider increasing' : 'Consider decreasing'} price from $${suggestion.current_price.toFixed(2)} to $${suggestion.suggested_price.toFixed(2)}. ${suggestion.reason}`,
            data: JSON.stringify({ productId: product.id, suggestion }),
          },
        });
      }
    }

    res.json({
      insights: pricingInsights,
      summary: {
        total_products: products.length,
        with_suggestions: pricingInsights.filter(i => i.suggestion).length,
        low_margin: pricingInsights.filter(i => i.margin_pct < i.target_margin_low).length,
        high_margin: pricingInsights.filter(i => i.margin_pct > i.target_margin_high).length,
      },
    });

  } catch (error) {
    console.error('Pricing insights error:', error);
    res.status(500).json({ error: 'Failed to generate pricing insights' });
  }
});

// GET /api/ai/insights/health
router.get('/health', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const { checkAllAIHealth } = await import('../lib/ai');
    const health = await checkAllAIHealth();
    
    res.json(health);
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({ error: 'Failed to check AI services health' });
  }
});

export default router;