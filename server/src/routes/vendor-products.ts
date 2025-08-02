import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { calculateMargin, generateAlertNote } from '../utils/marginCalculator';

const router = express.Router();

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
  alertNote: z.string().optional(),
  recipeId: z.string().uuid('Invalid recipe ID').optional(),
  onWatchlist: z.boolean().default(false),
  lastAiSuggestion: z.number().positive('AI suggestion must be positive').optional(),
  aiSuggestionNote: z.string().optional()
});

const updateProductSchema = createProductSchema.partial();

// AI Price Suggestion Function
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
  const costVariance = costs.reduce((sum, cost) => sum + Math.pow(cost - meanCost, 0), 0) / costs.length;
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

// GET /api/vendor/products - Get all products for the authenticated vendor
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // First get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get all products for this vendor
    const products = await prisma.product.findMany({
      where: { vendorProfileId: vendorProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
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
        details: validationResult.error.errors
      });
    }

    const productData = validationResult.data;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
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
    const product = await prisma.product.create({
      data: {
        ...productData,
        vendorProfileId: vendorProfile.id,
        tags: productData.tags || [],
        marginAlert,
        alertNote
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create product'
    });
  }
});

// GET /api/vendor/products/:id - Get a specific product by ID
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
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
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get current product to check if we need to recalculate margin alerts
    const currentProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!currentProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Calculate margin and check for alerts if price or cost is being updated
    let marginAlert = currentProduct.marginAlert;
    let alertNote = currentProduct.alertNote;
    
    if ((updateData.price !== undefined || updateData.cost !== undefined) && 
        (updateData.cost || currentProduct.cost) && 
        (updateData.price || currentProduct.price)) {
      
      const price = updateData.price || currentProduct.price;
      const cost = updateData.cost || currentProduct.cost;
      const targetMargin = updateData.targetMargin || currentProduct.targetMargin;
      
      const marginCalculation = calculateMargin(
        Number(price),
        cost || 0,
        targetMargin
      );
      
      marginAlert = marginCalculation.isAlertTriggered;
      alertNote = marginCalculation.isAlertTriggered 
        ? generateAlertNote(Number(price), cost || 0, targetMargin)
        : null;
    }

    // Update the product and ensure it belongs to this vendor
    const product = await prisma.product.updateMany({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      data: {
        ...updateData,
        marginAlert,
        alertNote
      }
    });

    if (product.count === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Get the updated product
    const updatedProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update product'
    });
  }
});

// GET /api/vendor/products/:id/margin - Calculate product margin and suggest pricing
router.get('/:id/margin', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product with its linked recipe and ensure it belongs to this vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Calculate unit cost from linked recipe
    let unitCost = 0;
    let recipeYield = 1;
    
    if (product.recipe) {
      // Calculate total cost of all ingredients
      let totalCost = 0;
      for (const recipeIngredient of product.recipe.recipeIngredients) {
        const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
        totalCost += ingredientCost;
      }
      
      // Calculate cost per unit based on recipe yield
      recipeYield = product.recipe.yield;
      unitCost = totalCost / recipeYield;
    }

    // Calculate current margin
    const currentPrice = Number(product.price);
    const currentMargin = unitCost > 0 ? ((currentPrice - unitCost) / currentPrice) * 100 : 0;

    // Determine margin status
    let status: 'danger' | 'warning' | 'safe' = 'safe';
    if (currentMargin < 0) {
      status = 'danger'; // Selling at a loss
    } else if (currentMargin < 20) {
      status = 'warning'; // Low margin
    } else {
      status = 'safe'; // Good margin
    }

    // Suggest price if targetMargin is set
    let suggestedPrice: number | null = null;
    if (product.targetMargin !== null && product.targetMargin !== undefined) {
      const targetMarginDecimal = product.targetMargin / 100;
      suggestedPrice = unitCost / (1 - targetMarginDecimal);
    }

    res.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: currentPrice,
        targetMargin: product.targetMargin
      },
      costAnalysis: {
        unitCost: Math.round(unitCost * 100) / 100, // Round to 2 decimal places
        recipeYield: recipeYield,
        hasRecipe: !!product.recipe
      },
      marginAnalysis: {
        currentMargin: Math.round(currentMargin * 100) / 100, // Round to 2 decimal places
        status: status,
        suggestedPrice: suggestedPrice ? Math.round(suggestedPrice * 100) / 100 : null
      }
    });
  } catch (error) {
    console.error('Error calculating product margin:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate product margin'
    });
  }
});

// DELETE /api/vendor/products/:id - Delete a product by ID
router.delete('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Delete the product and ensure it belongs to this vendor
    const product = await prisma.product.deleteMany({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (product.count === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete product'
    });
  }
});

// GET /api/vendor/products/:id/ai-suggestion - Get AI-powered price suggestion
router.get('/:id/ai-suggestion', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product with its linked recipe and ensure it belongs to this vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Calculate unit cost from linked recipe
    let unitCost = 0;
    
    if (product.recipe) {
      // Calculate total cost of all ingredients
      let totalCost = 0;
      for (const recipeIngredient of product.recipe.recipeIngredients) {
        const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
        totalCost += ingredientCost;
      }
      
      // Calculate cost per unit based on recipe yield
      const recipeYield = product.recipe.yield;
      unitCost = totalCost / recipeYield;
    }

    if (unitCost === 0) {
      return res.status(400).json({
        error: 'No recipe data',
        message: 'Product must have a linked recipe with ingredients to calculate AI suggestions'
      });
    }

    // Get target margin (use product's target margin or default to 30%)
    const targetMargin = product.targetMargin || 30;

    // For now, we'll simulate price history since we don't have a price history table
    // In a real implementation, this would come from a price history table
    const mockHistory: PriceHistory[] = [
      {
        price: Number(product.price),
        date: new Date().toISOString(),
        unitCost: unitCost
      }
    ];

    // Generate AI suggestion
    const aiSuggestion = suggestAiPrice(unitCost, mockHistory, targetMargin);

    // Update the product with the AI suggestion
    await prisma.product.update({
      where: { id: product.id },
      data: {
        lastAiSuggestion: aiSuggestion.suggestedPrice,
        aiSuggestionNote: aiSuggestion.note
      }
    });

    res.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: Number(product.price),
        targetMargin: targetMargin
      },
      costAnalysis: {
        unitCost: Math.round(unitCost * 100) / 100,
        hasRecipe: !!product.recipe
      },
      aiSuggestion: {
        suggestedPrice: aiSuggestion.suggestedPrice,
        note: aiSuggestion.note,
        volatilityDetected: aiSuggestion.volatilityDetected,
        confidence: aiSuggestion.confidence,
        priceDifference: Math.round((aiSuggestion.suggestedPrice - Number(product.price)) * 100) / 100,
        percentageChange: Math.round(((aiSuggestion.suggestedPrice - Number(product.price)) / Number(product.price)) * 100 * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error generating AI price suggestion:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI price suggestion'
    });
  }
});

// POST /api/vendor/products/:id/ai-suggest - Apply AI price suggestion and update product
router.post('/:id/ai-suggest', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product with its linked recipe and ensure it belongs to this vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Calculate unit cost from linked recipe
    let unitCost = 0;
    
    if (product.recipe) {
      // Calculate total cost of all ingredients
      let totalCost = 0;
      for (const recipeIngredient of product.recipe.recipeIngredients) {
        const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
        totalCost += ingredientCost;
      }
      
      // Calculate cost per unit based on recipe yield
      const recipeYield = product.recipe.yield;
      unitCost = totalCost / recipeYield;
    }

    if (unitCost === 0) {
      return res.status(400).json({
        error: 'No recipe data',
        message: 'Product must have a linked recipe with ingredients to calculate AI suggestions'
      });
    }

    // Get target margin (use product's target margin or default to 30%)
    const targetMargin = product.targetMargin || 30;

    // For now, we'll simulate price history since we don't have a price history table
    // In a real implementation, this would come from a price history table
    const mockHistory: PriceHistory[] = [
      {
        price: Number(product.price),
        date: new Date().toISOString(),
        unitCost: unitCost
      }
    ];

    // Generate AI suggestion
    const aiSuggestion = suggestAiPrice(unitCost, mockHistory, targetMargin);

    // Determine if product should be on watchlist based on AI analysis
    const shouldWatchlist = aiSuggestion.volatilityDetected || 
                           aiSuggestion.confidence < 0.6 || 
                           Math.abs(aiSuggestion.suggestedPrice - Number(product.price)) / Number(product.price) > 0.15;

    // Update the product with AI suggestion and watchlist status
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        lastAiSuggestion: aiSuggestion.suggestedPrice,
        aiSuggestionNote: aiSuggestion.note,
        onWatchlist: shouldWatchlist
      }
    });

    res.json({
      message: 'AI suggestion applied successfully',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        currentPrice: Number(updatedProduct.price),
        targetMargin: targetMargin,
        onWatchlist: updatedProduct.onWatchlist
      },
      costAnalysis: {
        unitCost: Math.round(unitCost * 100) / 100,
        hasRecipe: !!product.recipe
      },
      aiSuggestion: {
        suggestedPrice: aiSuggestion.suggestedPrice,
        note: aiSuggestion.note,
        volatilityDetected: aiSuggestion.volatilityDetected,
        confidence: aiSuggestion.confidence,
        priceDifference: Math.round((aiSuggestion.suggestedPrice - Number(product.price)) * 100) / 100,
        percentageChange: Math.round(((aiSuggestion.suggestedPrice - Number(product.price)) / Number(product.price)) * 100 * 100) / 100
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to apply AI price suggestion'
    });
  }
});

// GET /api/vendor/products/low-margin - Get products with low margins
router.get('/low-margin', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get all products for this vendor with margin analysis
    const products = await prisma.product.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    // Calculate margins for each product
    const productsWithMargins = await Promise.all(
      products.map(async (product) => {
        let unitCost = 0;
        let recipeYield = 1;
        
        if (product.recipe) {
          let totalCost = 0;
          for (const recipeIngredient of product.recipe.recipeIngredients) {
            const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
            totalCost += ingredientCost;
          }
          recipeYield = product.recipe.yield;
          unitCost = totalCost / recipeYield;
        }

        const currentPrice = Number(product.price);
        const currentMargin = unitCost > 0 ? ((currentPrice - unitCost) / currentPrice) * 100 : 0;

        let status: 'danger' | 'warning' | 'safe' = 'safe';
        if (currentMargin < 0) {
          status = 'danger';
        } else if (currentMargin < 20) {
          status = 'danger';
        } else if (currentMargin < 35) {
          status = 'warning';
        } else {
          status = 'safe';
        }

        return {
          ...product,
          marginAnalysis: {
            unitCost: Math.round(unitCost * 100) / 100,
            currentMargin: Math.round(currentMargin * 100) / 100,
            status,
            hasRecipe: !!product.recipe
          }
        };
      })
    );

    // Filter for low margin products (danger and warning status)
    const lowMarginProducts = productsWithMargins.filter(
      product => product.marginAnalysis.status === 'danger' || product.marginAnalysis.status === 'warning'
    );

    res.json({
      lowMarginProducts,
      count: lowMarginProducts.length,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Error fetching low margin products:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch low margin products'
    });
  }
});

// GET /api/vendor/products/ingredient-price-alerts - Get ingredient price change alerts
router.get('/ingredient-price-alerts', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get all products with recipes for this vendor
    const products = await prisma.product.findMany({
      where: { 
        vendorProfileId: vendorProfile.id,
        recipeId: { not: null }
      },
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    // Analyze ingredient price changes (mock data for now - in real app, this would track historical prices)
    const alerts = [];
    
    for (const product of products) {
      if (product.recipe) {
        for (const recipeIngredient of product.recipe.recipeIngredients) {
          const ingredient = recipeIngredient.ingredient;
          const currentCost = Number(ingredient.costPerUnit);
          
          // Mock price increase detection (in real app, this would compare with historical data)
          // For demo purposes, we'll simulate some price increases
          const mockPreviousCost = currentCost * 0.9; // Simulate 10% increase
          const priceIncrease = ((currentCost - mockPreviousCost) / mockPreviousCost) * 100;
          
          if (priceIncrease > 5) { // Alert if price increased by more than 5%
            alerts.push({
              productId: product.id,
              productName: product.name,
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              previousCost: Math.round(mockPreviousCost * 100) / 100,
              currentCost: Math.round(currentCost * 100) / 100,
              priceIncrease: Math.round(priceIncrease * 100) / 100,
              impact: {
                oldUnitCost: Math.round((mockPreviousCost * Number(recipeIngredient.quantity)) / product.recipe.yield * 100) / 100,
                newUnitCost: Math.round((currentCost * Number(recipeIngredient.quantity)) / product.recipe.yield * 100) / 100,
                costIncrease: Math.round(((currentCost - mockPreviousCost) * Number(recipeIngredient.quantity)) / product.recipe.yield * 100) / 100
              }
            });
          }
        }
      }
    }

    res.json({
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching ingredient price alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch ingredient price alerts'
    });
  }
});

// POST /api/vendor/products/batch-update-pricing - Batch update pricing based on target margins
router.post('/batch-update-pricing', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { targetMargin, productIds } = req.body;

    if (!targetMargin || targetMargin < 0 || targetMargin > 100) {
      return res.status(400).json({
        error: 'Invalid target margin',
        message: 'Target margin must be between 0 and 100'
      });
    }

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get products to update (either specific IDs or all products)
    const whereClause = productIds && productIds.length > 0 
      ? { 
          id: { in: productIds },
          vendorProfileId: vendorProfile.id 
        }
      : { vendorProfileId: vendorProfile.id };

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        recipe: {
          include: {
            recipeIngredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    const targetMarginDecimal = targetMargin / 100;
    const updatedProducts = [];
    const skippedProducts = [];

    for (const product of products) {
      let unitCost = 0;
      
      if (product.recipe) {
        let totalCost = 0;
        for (const recipeIngredient of product.recipe.recipeIngredients) {
          const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
          totalCost += ingredientCost;
        }
        unitCost = totalCost / product.recipe.yield;
      }

      if (unitCost > 0) {
        const suggestedPrice = unitCost / (1 - targetMarginDecimal);
        const currentPrice = Number(product.price);
        
        // Only update if the suggested price is significantly different (more than 5% change)
        const priceDifference = Math.abs(suggestedPrice - currentPrice) / currentPrice;
        
        if (priceDifference > 0.05) {
          const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { 
              price: Math.round(suggestedPrice * 100) / 100,
              targetMargin: targetMargin
            }
          });
          
          updatedProducts.push({
            id: product.id,
            name: product.name,
            oldPrice: currentPrice,
            newPrice: Math.round(suggestedPrice * 100) / 100,
            unitCost: Math.round(unitCost * 100) / 100,
            margin: targetMargin
          });
        } else {
          skippedProducts.push({
            id: product.id,
            name: product.name,
            reason: 'Price change too small'
          });
        }
      } else {
        skippedProducts.push({
          id: product.id,
          name: product.name,
          reason: 'No recipe or cost data available'
        });
      }
    }

    res.json({
      message: 'Batch pricing update completed',
      updatedProducts,
      skippedProducts,
      summary: {
        total: products.length,
        updated: updatedProducts.length,
        skipped: skippedProducts.length
      }
    });
  } catch (error) {
    console.error('Error in batch pricing update:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update pricing'
    });
  }
});

// GET /api/vendor/products/alerts/margin - Get products with margin alerts
router.get('/alerts/margin', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get products with margin alerts
    const productsWithAlerts = await prisma.product.findMany({
      where: {
        vendorProfileId: vendorProfile.id,
        marginAlert: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate current margin for each product
    const productsWithMarginData = productsWithAlerts.map(product => {
      const cost = product.cost || 0;
      const price = Number(product.price);
      const margin = price - cost;
      const marginPercentage = price > 0 ? (margin / price) * 100 : 0;

      return {
        ...product,
        currentMargin: margin,
        currentMarginPercentage: marginPercentage
      };
    });

    res.json({
      products: productsWithMarginData,
      count: productsWithMarginData.length,
      summary: {
        totalAlerts: productsWithMarginData.length,
        lowMarginCount: productsWithMarginData.filter(p => p.currentMarginPercentage < 15).length,
        highCostCount: productsWithMarginData.filter(p => p.cost && p.cost / Number(p.price) > 0.7).length
      }
    });
  } catch (error) {
    console.error('Error fetching products with margin alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch products with margin alerts'
    });
  }
});

export default router; 