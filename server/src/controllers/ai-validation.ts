import prisma from '../lib/prisma';
import { validateCostToMargin, calculateMarginWithAI } from '../utils/marginCalculator';

// Mock market data - in production, this would come from external APIs or databases
const MARKET_DATA = {
  'bakery': {
    averageMargin: 28,
    priceRange: { min: 8, max: 45 },
    costEfficiency: 0.72
  },
  'jewelry': {
    averageMargin: 45,
    priceRange: { min: 25, max: 500 },
    costEfficiency: 0.55
  },
  'ceramics': {
    averageMargin: 32,
    priceRange: { min: 15, max: 120 },
    costEfficiency: 0.68
  },
  'textiles': {
    averageMargin: 25,
    priceRange: { min: 12, max: 85 },
    costEfficiency: 0.75
  },
  'woodworking': {
    averageMargin: 35,
    priceRange: { min: 20, max: 200 },
    costEfficiency: 0.65
  },
  'default': {
    averageMargin: 25,
    priceRange: { min: 10, max: 100 },
    costEfficiency: 0.70
  }
};

export const validateProductPricing = async (req: any, res: any) => {
  try {
    const { price, cost, targetMargin, productCategory, productId } = req.body;

    // Validate required fields
    if (!price || !cost) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Price and cost are required for validation'
      });
    }

    // Get market data for the category
    const marketData = MARKET_DATA[productCategory as keyof typeof MARKET_DATA] || MARKET_DATA.default;

    // Perform AI validation
    const validation = validateCostToMargin(
      parseFloat(price),
      parseFloat(cost),
      targetMargin ? parseFloat(targetMargin) : undefined,
      productCategory,
      { [productCategory || 'default']: marketData }
    );

    // If productId is provided, get additional context
    let productContext = null;
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          cost: true,
          targetMargin: true,
          marginAlert: true,
          alertNote: true,
          tags: true
        }
      });

      if (product) {
        productContext = {
          currentPrice: product.price,
          currentCost: product.cost,
          currentTargetMargin: product.targetMargin,
          hasMarginAlert: product.marginAlert,
          currentAlertNote: product.alertNote,
          tags: product.tags
        };
      }
    }

    // Generate recommendations
    const recommendations = generatePricingRecommendations(
      parseFloat(price),
      parseFloat(cost),
      targetMargin ? parseFloat(targetMargin) : undefined,
      validation,
      marketData
    );

    res.json({
      validation,
      marketData,
      productContext,
      recommendations,
      timestamp: new Date().toISOString(),
      message: 'AI validation completed successfully'
    });

  } catch (error) {
    console.error('Error validating product pricing:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: 'Unable to perform AI validation'
    });
  }
};

export const validateBulkPricing = async (req: any, res: any) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: 'Invalid products array',
        message: 'Products array is required and must not be empty'
      });
    }

    const results = [];

    for (const product of products) {
      const { price, cost, targetMargin, productCategory, productId } = product;

      if (!price || !cost) {
        results.push({
          productId,
          error: 'Missing price or cost',
          validation: null
        });
        continue;
      }

      const marketData = MARKET_DATA[productCategory as keyof typeof MARKET_DATA] || MARKET_DATA.default;
      
      const validation = validateCostToMargin(
        parseFloat(price),
        parseFloat(cost),
        targetMargin ? parseFloat(targetMargin) : undefined,
        productCategory,
        { [productCategory || 'default']: marketData }
      );

      const recommendations = generatePricingRecommendations(
        parseFloat(price),
        parseFloat(cost),
        targetMargin ? parseFloat(targetMargin) : undefined,
        validation,
        marketData
      );

      results.push({
        productId,
        validation,
        recommendations,
        marketData
      });
    }

    // Calculate summary statistics
    const summary = calculateBulkValidationSummary(results);

    res.json({
      results,
      summary,
      timestamp: new Date().toISOString(),
      message: 'Bulk validation completed successfully'
    });

  } catch (error) {
    console.error('Error validating bulk pricing:', error);
    res.status(500).json({
      error: 'Bulk validation failed',
      message: 'Unable to perform bulk AI validation'
    });
  }
};

export const getMarketInsights = async (req: any, res: any) => {
  try {
    const { productCategory } = req.query;

    const marketData = MARKET_DATA[productCategory as keyof typeof MARKET_DATA] || MARKET_DATA.default;

    // Generate insights based on market data
    const insights = generateMarketInsights(productCategory, marketData);

    res.json({
      category: productCategory || 'default',
      marketData,
      insights,
      timestamp: new Date().toISOString(),
      message: 'Market insights retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting market insights:', error);
    res.status(500).json({
      error: 'Failed to get market insights',
      message: 'Unable to retrieve market data'
    });
  }
};

// Helper functions
function generatePricingRecommendations(
  price: number,
  cost: number,
  targetMargin: number | undefined,
  validation: any,
  marketData: any
) {
  const recommendations = {
    immediate: [] as string[],
    shortTerm: [] as string[],
    longTerm: [] as string[],
    pricingOptions: [] as any[]
  };

  const marginPercentage = ((price - cost) / price) * 100;

  // Immediate recommendations
  if (validation.riskLevel === 'high') {
    recommendations.immediate.push('Urgent: Review pricing strategy immediately');
    recommendations.immediate.push('Consider temporary price increase to cover costs');
  }

  if (cost > price * 0.8) {
    recommendations.immediate.push('Investigate cost reduction opportunities');
  }

  // Short-term recommendations
  if (marginPercentage < marketData.averageMargin) {
    recommendations.shortTerm.push(`Target margin of ${marketData.averageMargin}% to match market average`);
  }

  if (price < marketData.priceRange.min) {
    recommendations.shortTerm.push('Consider price increase to align with market minimum');
  }

  // Long-term recommendations
  recommendations.longTerm.push('Implement cost tracking system for better insights');
  recommendations.longTerm.push('Regular market analysis to stay competitive');
  recommendations.longTerm.push('Consider value-added services to justify premium pricing');

  // Pricing options
  if (targetMargin) {
    const targetPrice = cost / (1 - targetMargin / 100);
    recommendations.pricingOptions.push({
      type: 'target_margin',
      price: targetPrice,
      margin: targetMargin,
      description: `Price to achieve ${targetMargin}% margin`
    });
  }

  const marketPrice = (marketData.priceRange.min + marketData.priceRange.max) / 2;
  recommendations.pricingOptions.push({
    type: 'market_average',
    price: marketPrice,
    margin: ((marketPrice - cost) / marketPrice) * 100,
    description: 'Market average pricing'
  });

  const competitivePrice = cost * 1.3; // 30% markup
  recommendations.pricingOptions.push({
    type: 'competitive',
    price: competitivePrice,
    margin: 30,
    description: 'Competitive pricing (30% markup)'
  });

  return recommendations;
}

function calculateBulkValidationSummary(results: any[]) {
  const validProducts = results.filter(r => r.validation && r.validation.isValid);
  const highRiskProducts = results.filter(r => r.validation && r.validation.riskLevel === 'high');
  const mediumRiskProducts = results.filter(r => r.validation && r.validation.riskLevel === 'medium');

  const totalProducts = results.length;
  const validCount = validProducts.length;
  const highRiskCount = highRiskProducts.length;
  const mediumRiskCount = mediumRiskProducts.length;

  return {
    totalProducts,
    validProducts: validCount,
    highRiskProducts: highRiskCount,
    mediumRiskProducts: mediumRiskCount,
    validationRate: totalProducts > 0 ? (validCount / totalProducts) * 100 : 0,
    riskDistribution: {
      low: totalProducts - highRiskCount - mediumRiskCount,
      medium: mediumRiskCount,
      high: highRiskCount
    }
  };
}

function generateMarketInsights(category: string, marketData: any) {
  return {
    averageMargin: marketData.averageMargin,
    priceRange: marketData.priceRange,
    costEfficiency: marketData.costEfficiency,
    recommendations: [
      `Target ${marketData.averageMargin}% margin to stay competitive`,
      `Price range: $${marketData.priceRange.min} - $${marketData.priceRange.max}`,
      `Maintain cost efficiency above ${(marketData.costEfficiency * 100).toFixed(0)}%`,
      'Regular price reviews recommended',
      'Monitor competitor pricing strategies'
    ],
    trends: [
      'Seasonal pricing adjustments common',
      'Premium positioning possible with quality differentiation',
      'Cost optimization key to maintaining margins'
    ]
  };
} 