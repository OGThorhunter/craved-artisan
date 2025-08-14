import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth-mock';
import { z } from 'zod';
import { calculateMargin, generateAlertNote } from '../utils/marginCalculator';

const router = express.Router();

// AI Price Suggestion Function (Mock version)
interface PriceHistory {
  price: number;
  date: string;
  unitCost: number;
}

interface AiSuggestionResult {
  suggestedPrice: number;
  note: string;
  volatilityDetected: boolean;
  confidence: number;
}

function suggestAiPrice(
  unitCost: number, 
  history: PriceHistory[], 
  targetMargin: number
): AiSuggestionResult {
  if (history.length === 0) {
    // No history available, use basic calculation
    const suggestedPrice = unitCost / (1 - targetMargin / 100);
    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      note: 'No price history available. Using basic margin calculation.',
      volatilityDetected: false,
      confidence: 0.5
    };
  }

  // Calculate price volatility
  const prices = history.map(h => h.price);
  const meanPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - meanPrice, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / meanPrice;

  // Detect volatility (CV > 0.15 indicates high volatility)
  const volatilityDetected = coefficientOfVariation > 0.15;

  // Calculate cost volatility
  const costs = history.map(h => h.unitCost);
  const meanCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
  const costVariance = costs.reduce((sum, cost) => sum + Math.pow(cost - meanCost, 2), 0) / costs.length;
  const costStandardDeviation = Math.sqrt(costVariance);
  const costCoefficientOfVariation = costStandardDeviation / meanCost;

  // Calculate trend (simple linear regression)
  const n = history.length;
  const sumX = history.reduce((sum, _, index) => sum + index, 0);
  const sumY = history.reduce((sum, h) => sum + h.price, 0);
  const sumXY = history.reduce((sum, h, index) => sum + index * h.price, 0);
  const sumX2 = history.reduce((sum, _, index) => sum + index * index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';

  // Calculate suggested price based on multiple factors
  let suggestedPrice: number;
  let note: string;
  let confidence: number;

  if (volatilityDetected) {
    // High volatility: use more conservative pricing
    const volatilityAdjustment = 1 + (coefficientOfVariation * 0.1);
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * volatilityAdjustment;
    note = `High price volatility detected (${(coefficientOfVariation * 100).toFixed(1)}% CV). Using conservative pricing with ${(volatilityAdjustment * 100 - 100).toFixed(1)}% adjustment.`;
    confidence = 0.7;
  } else if (costCoefficientOfVariation > 0.1) {
    // High cost volatility: adjust for cost uncertainty
    const costAdjustment = 1 + (costCoefficientOfVariation * 0.05);
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * costAdjustment;
    note = `High cost volatility detected (${(costCoefficientOfVariation * 100).toFixed(1)}% CV). Adjusting for cost uncertainty.`;
    confidence = 0.8;
  } else {
    // Stable conditions: use trend-adjusted pricing
    const trendAdjustment = trend === 'increasing' ? 1.02 : trend === 'decreasing' ? 0.98 : 1.0;
    const basePrice = unitCost / (1 - targetMargin / 100);
    suggestedPrice = basePrice * trendAdjustment;
    note = `Stable market conditions. ${trend} price trend detected. Using trend-adjusted pricing.`;
    confidence = 0.9;
  }

  // Ensure minimum margin is maintained
  const minMargin = targetMargin * 0.8; // Allow 20% margin buffer
  const minPrice = unitCost / (1 - minMargin / 100);
  if (suggestedPrice < minPrice) {
    suggestedPrice = minPrice;
    note += ' Adjusted to maintain minimum margin requirements.';
  }

  return {
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    note,
    volatilityDetected,
    confidence
  };
}

// Mock product data
let mockProducts = [
  {
    id: 'mock-product-1',
    vendorProfileId: 'mock-vendor-id',
    name: 'Handcrafted Wooden Bowl',
    description: 'Beautiful hand-carved wooden bowl made from sustainable oak',
    price: 45.99,
    cost: 25.00,
    imageUrl: 'https://placekitten.com/400/300',
    tags: ['handmade', 'wooden', 'artisan'],
    stock: 5,
    isAvailable: true,
    targetMargin: 35.0,
    marginAlert: false,
    alertNote: null,
    recipeId: 'mock-recipe-1',
    onWatchlist: false,
    lastAiSuggestion: null,
    aiSuggestionNote: null,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'mock-product-2',
    vendorProfileId: 'mock-vendor-id',
    name: 'Ceramic Coffee Mug',
    description: 'Hand-thrown ceramic coffee mug with unique glaze',
    price: 22.50,
    cost: 18.00, // High cost ratio, should trigger alert
    imageUrl: 'https://placekitten.com/400/301',
    tags: ['ceramic', 'coffee', 'handmade'],
    stock: 12,
    isAvailable: true,
    targetMargin: 25.0,
    marginAlert: true,
    alertNote: '⚠️ Margin Alert: Cost ratio (80.0%) too high (>70%). Suggestions: Review ingredient costs and supplier pricing',
    recipeId: 'mock-recipe-2',
    onWatchlist: true,
    lastAiSuggestion: 24.75,
    aiSuggestionNote: 'Previous AI suggestion applied',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 'mock-product-3',
    vendorProfileId: 'mock-vendor-id',
    name: 'Low Margin Test Product',
    description: 'A product with very low margin to test alerts',
    price: 10.00,
    cost: 9.00, // 90% cost ratio, very low margin
    imageUrl: 'https://placekitten.com/400/302',
    tags: ['test', 'low-margin'],
    stock: 3,
    isAvailable: true,
    targetMargin: 25.0,
    marginAlert: true,
    alertNote: '⚠️ Margin Alert: Margin (10.0%) below minimum (15%); Cost ratio (90.0%) too high (>70%). Suggestions: Consider increasing price or reducing costs; Review ingredient costs and supplier pricing',
    recipeId: null,
    onWatchlist: false,
    lastAiSuggestion: null,
    aiSuggestionNote: null,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  }
];

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().positive('Cost must be positive').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  isAvailable: z.boolean().default(true),
  targetMargin: z.number().min(0, 'Target margin must be non-negative').max(100, 'Target margin cannot exceed 100%').optional(),
  marginAlert: z.boolean().default(false),
  alertNote: z.string().optional()
});

const updateProductSchema = createProductSchema.partial();

// GET /api/vendor/products - Get all products for the authenticated vendor
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Simulate vendor profile lookup
    if (req.session.userId === 'mock-user-id') {
      const vendorProducts = mockProducts.filter(product => product.vendorProfileId === 'mock-vendor-id');
      
      return res.json({
        products: vendorProducts,
        count: vendorProducts.length
      });
    } else {
      return res.json({
        products: [],
        count: 0
      });
    }
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch products'
    });
  }
});

// POST /api/vendor/products - Create a new product
router.post('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Validate request body
    const validationResult = createProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors
      });
    }

    const productData = validationResult.data;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Calculate margin and check for alerts if cost is provided
    let marginAlert = false;
    let alertNote = null;
    
    if (productData.cost && productData.price) {
      const marginCalculation = calculateMargin(
        productData.price,
        productData.cost,
        productData.targetMargin
      );
      
      marginAlert = marginCalculation.isAlertTriggered;
      alertNote = marginCalculation.isAlertTriggered 
        ? generateAlertNote(productData.price, productData.cost, productData.targetMargin)
        : null;
    }

    // Create the product
    const newProduct = {
      id: `mock-product-${Date.now()}`,
      vendorProfileId: 'mock-vendor-id',
      ...productData,
      tags: productData.tags || [],
      marginAlert,
      alertNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockProducts.push({ ...newProduct, recipeId: null, onWatchlist: false, lastAiSuggestion: null, aiSuggestionNote: null });

    return res.status(400).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to create product'
    });
  }
});

// GET /api/vendor/products/:id - Get a specific product by ID
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = mockProducts.find(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (!product) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch product'
    });
  }
});

// PUT /api/vendor/products/:id - Update a product by ID
router.put('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = updateProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors
      });
    }

    const updateData = validationResult.data;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Find and update the product
    const productIndex = mockProducts.findIndex(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (productIndex === -1) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Calculate margin and check for alerts if price or cost is being updated
    let marginAlert = mockProducts[productIndex].marginAlert;
    let alertNote = mockProducts[productIndex].alertNote;
    
    if ((updateData.price !== undefined || updateData.cost !== undefined) && 
        (updateData.cost || mockProducts[productIndex].cost) && 
        (updateData.price || mockProducts[productIndex].price)) {
      
      const price = updateData.price || mockProducts[productIndex].price;
      const cost = updateData.cost || mockProducts[productIndex].cost;
      const targetMargin = updateData.targetMargin || mockProducts[productIndex].targetMargin;
      
      const marginCalculation = calculateMargin(
        price,
        cost || 0,
        targetMargin
      );
      
      marginAlert = marginCalculation.isAlertTriggered;
      alertNote = marginCalculation.isAlertTriggered 
        ? generateAlertNote(price, cost || 0, targetMargin)
        : null;
    }

    // Update the product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updateData,
      marginAlert,
      alertNote,
      updatedAt: new Date().toISOString()
    };

    return res.json({
      message: 'Product updated successfully',
      product: mockProducts[productIndex]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to update product'
    });
  }
});

// DELETE /api/vendor/products/:id - Delete a product by ID
router.delete('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Find and delete the product
    const productIndex = mockProducts.findIndex(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (productIndex === -1) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Remove the product
    mockProducts.splice(productIndex, 1);

    return res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to delete product'
    });
  }
});

// GET /api/vendor/products/:id/ai-suggestion - Get AI-powered price suggestion
router.get('/:id/ai-suggestion', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = mockProducts.find(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (!product) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Mock unit cost calculation (in real implementation, this would come from recipe)
    const unitCost = product.price * 0.6; // Assume 60% of price is cost

    // Get target margin (use product's target margin or default to 30%)
    const targetMargin = product.targetMargin || 30;

    // Mock price history
    const mockHistory: PriceHistory[] = [
      {
        price: product.price,
        date: new Date().toISOString(),
        unitCost: unitCost
      }
    ];

    // Generate AI suggestion
    const aiSuggestion = suggestAiPrice(unitCost, mockHistory, targetMargin);

    // Update the product with the AI suggestion
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        lastAiSuggestion: aiSuggestion.suggestedPrice,
        aiSuggestionNote: aiSuggestion.note,
        updatedAt: new Date().toISOString()
      };
    }

    return res.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        targetMargin: targetMargin
      },
      costAnalysis: {
        unitCost: Math.round(unitCost * 100) / 100,
        hasRecipe: !!product.recipeId
      },
      aiSuggestion: {
        suggestedPrice: aiSuggestion.suggestedPrice,
        note: aiSuggestion.note,
        volatilityDetected: aiSuggestion.volatilityDetected,
        confidence: aiSuggestion.confidence,
        priceDifference: Math.round((aiSuggestion.suggestedPrice - product.price) * 100) / 100,
        percentageChange: Math.round(((aiSuggestion.suggestedPrice - product.price) / product.price) * 100 * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error generating AI price suggestion:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to generate AI price suggestion'
    });
  }
});

// POST /api/vendor/products/:id/ai-suggest - Apply AI price suggestion and update product
router.post('/:id/ai-suggest', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = mockProducts.find(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (!product) {
      return res.status(400).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Mock unit cost calculation (in real implementation, this would come from recipe)
    const unitCost = product.price * 0.6; // Assume 60% of price is cost

    // Get target margin (use product's target margin or default to 30%)
    const targetMargin = product.targetMargin || 30;

    // Mock price history
    const mockHistory: PriceHistory[] = [
      {
        price: product.price,
        date: new Date().toISOString(),
        unitCost: unitCost
      }
    ];

    // Generate AI suggestion
    const aiSuggestion = suggestAiPrice(unitCost, mockHistory, targetMargin);

    // Determine if product should be on watchlist based on AI analysis
    const shouldWatchlist = aiSuggestion.volatilityDetected || 
                           aiSuggestion.confidence < 0.6 || 
                           Math.abs(aiSuggestion.suggestedPrice - product.price) / product.price > 0.15;

    // Update the product with AI suggestion and watchlist status
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      mockProducts[productIndex] = {
        ...mockProducts[productIndex],
        lastAiSuggestion: aiSuggestion.suggestedPrice,
        aiSuggestionNote: aiSuggestion.note,
        onWatchlist: shouldWatchlist,
        updatedAt: new Date().toISOString()
      };
    }

    return res.json({
      message: 'AI suggestion applied successfully',
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        targetMargin: targetMargin,
        onWatchlist: shouldWatchlist
      },
      costAnalysis: {
        unitCost: Math.round(unitCost * 100) / 100,
        hasRecipe: !!product.recipeId
      },
      aiSuggestion: {
        suggestedPrice: aiSuggestion.suggestedPrice,
        note: aiSuggestion.note,
        volatilityDetected: aiSuggestion.volatilityDetected,
        confidence: aiSuggestion.confidence,
        priceDifference: Math.round((aiSuggestion.suggestedPrice - product.price) * 100) / 100,
        percentageChange: Math.round(((aiSuggestion.suggestedPrice - product.price) / product.price) * 100 * 100) / 100
      },
      watchlistUpdate: {
        addedToWatchlist: shouldWatchlist,
        reason: shouldWatchlist ? 
          (aiSuggestion.volatilityDetected ? 'High volatility detected' :
           aiSuggestion.confidence < 0.6 ? 'Low confidence in suggestion' :
           'Significant price difference') : 'No monitoring needed'
      }
    });
  } catch (error) {
    console.error('Error applying AI price suggestion:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to apply AI price suggestion'
    });
  }
});

// GET /api/vendor/products/alerts/margin - Get products with margin alerts
router.get('/alerts/margin', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get products with margin alerts
    const productsWithAlerts = mockProducts.filter(product => 
      product.vendorProfileId === 'mock-vendor-id' && product.marginAlert === true
    );

    // Calculate current margin for each product
    const productsWithMarginData = productsWithAlerts.map(product => {
      const cost = product.cost || 0;
      const price = product.price;
      const margin = price - cost;
      const marginPercentage = price > 0 ? (margin / price) * 100 : 0;

      return {
        ...product,
        currentMargin: margin,
        currentMarginPercentage: marginPercentage
      };
    });

    return res.json({
      products: productsWithMarginData,
      count: productsWithMarginData.length,
      summary: {
        totalAlerts: productsWithMarginData.length,
        lowMarginCount: productsWithMarginData.filter(p => p.currentMarginPercentage < 15).length,
        highCostCount: productsWithMarginData.filter(p => p.cost && p.cost / p.price > 0.7).length
      }
    });
  } catch (error) {
    console.error('Error fetching products with margin alerts:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch products with margin alerts'
    });
  }
});

export default router; 