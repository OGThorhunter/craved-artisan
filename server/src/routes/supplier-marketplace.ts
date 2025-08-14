import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Mock supplier marketplace data
let suppliers = [
  {
    id: 'supplier-1',
    name: 'Local Market',
    rating: 4.8,
    deliveryTime: '1-2 days',
    minimumOrder: 50.00,
    isActive: true,
    specialties: ['organic', 'local'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supplier-2',
    name: 'Farm Fresh Co.',
    rating: 4.6,
    deliveryTime: '2-3 days',
    minimumOrder: 25.00,
    isActive: true,
    specialties: ['farm-direct', 'fresh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supplier-3',
    name: 'Spice World',
    rating: 4.9,
    deliveryTime: '3-5 days',
    minimumOrder: 100.00,
    isActive: true,
    specialties: ['spices', 'imported'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supplier-4',
    name: 'Dairy Delights',
    rating: 4.7,
    deliveryTime: '1 day',
    minimumOrder: 30.00,
    isActive: true,
    specialties: ['dairy', 'fresh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supplier-5',
    name: 'Sweet Supplies',
    rating: 4.5,
    deliveryTime: '2-4 days',
    minimumOrder: 75.00,
    isActive: true,
    specialties: ['sweeteners', 'bulk'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'supplier-6',
    name: 'Bulk Barn',
    rating: 4.4,
    deliveryTime: '3-5 days',
    minimumOrder: 150.00,
    isActive: true,
    specialties: ['bulk', 'wholesale'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let supplierInventory = [
  // Organic Flour - multiple suppliers
  {
    id: 'si-1',
    supplierId: 'supplier-1',
    ingredientName: 'Organic Flour',
    brand: 'Local Market Organic',
    unit: 'kilograms',
    pricePerUnit: 3.50,
    availableQuantity: 100.0,
    minimumOrderQuantity: 5.0,
    isOrganic: true,
    isPreferred: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'si-2',
    supplierId: 'supplier-6',
    ingredientName: 'Organic Flour',
    brand: 'Bulk Barn Premium',
    unit: 'kilograms',
    pricePerUnit: 3.25,
    availableQuantity: 500.0,
    minimumOrderQuantity: 25.0,
    isOrganic: true,
    isPreferred: false,
    lastUpdated: new Date().toISOString()
  },
  // Fresh Eggs - multiple suppliers
  {
    id: 'si-3',
    supplierId: 'supplier-2',
    ingredientName: 'Fresh Eggs',
    brand: 'Farm Fresh Organic',
    unit: 'pieces',
    pricePerUnit: 0.75,
    availableQuantity: 200,
    minimumOrderQuantity: 12,
    isOrganic: true,
    isPreferred: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'si-4',
    supplierId: 'supplier-4',
    ingredientName: 'Fresh Eggs',
    brand: 'Dairy Delights Farm',
    unit: 'pieces',
    pricePerUnit: 0.65,
    availableQuantity: 150,
    minimumOrderQuantity: 24,
    isOrganic: false,
    isPreferred: false,
    lastUpdated: new Date().toISOString()
  },
  // Vanilla Extract - multiple suppliers
  {
    id: 'si-5',
    supplierId: 'supplier-3',
    ingredientName: 'Vanilla Extract',
    brand: 'Spice World Pure',
    unit: 'bottles',
    pricePerUnit: 12.00,
    availableQuantity: 50,
    minimumOrderQuantity: 5,
    isOrganic: true,
    isPreferred: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'si-6',
    supplierId: 'supplier-6',
    ingredientName: 'Vanilla Extract',
    brand: 'Bulk Barn Standard',
    unit: 'bottles',
    pricePerUnit: 9.50,
    availableQuantity: 100,
    minimumOrderQuantity: 10,
    isOrganic: false,
    isPreferred: false,
    lastUpdated: new Date().toISOString()
  },
  // Butter - multiple suppliers
  {
    id: 'si-7',
    supplierId: 'supplier-4',
    ingredientName: 'Butter',
    brand: 'Dairy Delights Unsalted',
    unit: 'pounds',
    pricePerUnit: 4.25,
    availableQuantity: 50.0,
    minimumOrderQuantity: 5.0,
    isOrganic: false,
    isPreferred: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'si-8',
    supplierId: 'supplier-1',
    ingredientName: 'Butter',
    brand: 'Local Market Organic',
    unit: 'pounds',
    pricePerUnit: 5.50,
    availableQuantity: 20.0,
    minimumOrderQuantity: 2.0,
    isOrganic: true,
    isPreferred: false,
    lastUpdated: new Date().toISOString()
  },
  // Sugar - multiple suppliers
  {
    id: 'si-9',
    supplierId: 'supplier-5',
    ingredientName: 'Sugar',
    brand: 'Sweet Supplies Granulated',
    unit: 'pounds',
    pricePerUnit: 2.50,
    availableQuantity: 200.0,
    minimumOrderQuantity: 10.0,
    isOrganic: false,
    isPreferred: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'si-10',
    supplierId: 'supplier-6',
    ingredientName: 'Sugar',
    brand: 'Bulk Barn Organic',
    unit: 'pounds',
    pricePerUnit: 3.75,
    availableQuantity: 300.0,
    minimumOrderQuantity: 25.0,
    isOrganic: true,
    isPreferred: false,
    lastUpdated: new Date().toISOString()
  }
];

// Price tracking history
let priceHistory = [
  {
    id: 'ph-1',
    supplierInventoryId: 'si-1',
    ingredientName: 'Organic Flour',
    supplierName: 'Local Market',
    pricePerUnit: 3.50,
    recordedAt: new Date().toISOString()
  },
  {
    id: 'ph-2',
    supplierInventoryId: 'si-1',
    ingredientName: 'Organic Flour',
    supplierName: 'Local Market',
    pricePerUnit: 3.25,
    recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
  },
  {
    id: 'ph-3',
    supplierInventoryId: 'si-3',
    ingredientName: 'Fresh Eggs',
    supplierName: 'Farm Fresh Co.',
    pricePerUnit: 0.75,
    recordedAt: new Date().toISOString()
  },
  {
    id: 'ph-4',
    supplierInventoryId: 'si-3',
    ingredientName: 'Fresh Eggs',
    supplierName: 'Farm Fresh Co.',
    pricePerUnit: 0.70,
    recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
  }
];

// Validation schemas
const searchIngredientsSchema = z.object({
  ingredientName: z.string().min(1, 'Ingredient name is required'),
  preferredOnly: z.boolean().optional().default(false),
  organicOnly: z.boolean().optional().default(false),
  maxPrice: z.number().optional()
});

const trackPriceSchema = z.object({
  supplierInventoryId: z.string().min(1, 'Supplier inventory ID is required'),
  pricePerUnit: z.number().min(0, 'Price must be positive')
});

// Middleware to validate request body
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
};

/**
 * Search for ingredients across supplier marketplace
 * @param ingredientName - Name of the ingredient to search for
 * @param preferredOnly - Only return preferred suppliers
 * @param organicOnly - Only return organic options
 * @param maxPrice - Maximum price per unit
 * @returns Array of available supplier options
 */
const searchSupplierIngredients = (
  ingredientName: string,
  preferredOnly: boolean = false,
  organicOnly: boolean = false,
  maxPrice?: number
) => {
  try {
    let results = supplierInventory.filter(item => 
      item.ingredientName.toLowerCase().includes(ingredientName.toLowerCase()) &&
      item.availableQuantity > 0
    );

    // Apply filters
    if (preferredOnly) {
      results = results.filter(item => item.isPreferred);
    }

    if (organicOnly) {
      results = results.filter(item => item.isOrganic);
    }

    if (maxPrice) {
      results = results.filter(item => item.pricePerUnit <= maxPrice);
    }

    // Sort by price (lowest first), then by preference, then by rating
    results.sort((a, b) => {
      // First sort by price
      if (a.pricePerUnit !== b.pricePerUnit) {
        return a.pricePerUnit - b.pricePerUnit;
      }
      // Then by preference
      if (a.isPreferred !== b.isPreferred) {
        return a.isPreferred ? -1 : 1;
      }
      // Then by supplier rating
      const supplierA = suppliers.find(s => s.id === a.supplierId);
      const supplierB = suppliers.find(s => s.id === b.supplierId);
      if (supplierA && supplierB) {
        return supplierB.rating - supplierA.rating;
      }
      return 0;
    });

    // Enrich results with supplier information
    return results.map(item => {
      const supplier = suppliers.find(s => s.id === item.supplierId);
      return {
        ...item,
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.name,
          rating: supplier.rating,
          deliveryTime: supplier.deliveryTime,
          minimumOrder: supplier.minimumOrder,
          specialties: supplier.specialties
        } : null
      };
    });

  } catch (error) {
    console.error('Error in searchSupplierIngredients:', error);
    return [];
  }
};

/**
 * Get price history for an ingredient across suppliers
 * @param ingredientName - Name of the ingredient
 * @param days - Number of days to look back
 * @returns Price history data
 */
const getPriceHistory = (ingredientName: string, days: number = 30) => {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return priceHistory.filter(record => 
      record.ingredientName.toLowerCase().includes(ingredientName.toLowerCase()) &&
      new Date(record.recordedAt) >= cutoffDate
    ).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  } catch (error) {
    console.error('Error in getPriceHistory:', error);
    return [];
  }
};

/**
 * Track price change for supplier inventory
 * @param supplierInventoryId - ID of the supplier inventory item
 * @param pricePerUnit - New price per unit
 */
const trackPriceChange = (supplierInventoryId: string, pricePerUnit: number) => {
  try {
    const inventoryItem = supplierInventory.find(item => item.id === supplierInventoryId);
    if (!inventoryItem) {
      throw new Error('Supplier inventory item not found');
    }

    const supplier = suppliers.find(s => s.id === inventoryItem.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Update current price
    inventoryItem.pricePerUnit = pricePerUnit;
    inventoryItem.lastUpdated = new Date().toISOString();

    // Add to price history
    const newPriceRecord = {
      id: `ph-${Date.now()}`,
      supplierInventoryId,
      ingredientName: inventoryItem.ingredientName,
      supplierName: supplier.name,
      pricePerUnit,
      recordedAt: new Date().toISOString()
    };

    priceHistory.push(newPriceRecord);

    return newPriceRecord;

  } catch (error) {
    console.error('Error in trackPriceChange:', error);
    throw error;
  }
};

/**
 * Get low stock recommendations with supplier alternatives
 * @param lowStockIngredients - Array of ingredients that are low in stock
 * @returns Recommendations with supplier options
 */
const getLowStockRecommendations = (lowStockIngredients: any[]) => {
  try {
    const recommendations = [];

    for (const ingredient of lowStockIngredients) {
      const supplierOptions = searchSupplierIngredients(
        ingredient.ingredientName,
        false, // Include non-preferred options
        false, // Include non-organic options
        undefined // No price limit
      );

      if (supplierOptions.length > 0) {
        const priceHistory = getPriceHistory(ingredient.ingredientName, 30);
        const priceTrend = priceHistory.length >= 2 ? 
          priceHistory[0].pricePerUnit - priceHistory[priceHistory.length - 1].pricePerUnit : 0;

        recommendations.push({
          ingredientId: ingredient.ingredientId,
          ingredientName: ingredient.ingredientName,
          currentStock: ingredient.currentStock,
          lowStockThreshold: ingredient.lowStockThreshold,
          unit: ingredient.unit,
          supplierOptions: supplierOptions.slice(0, 5), // Top 5 options
          priceTrend: priceTrend,
          priceTrendDirection: priceTrend > 0 ? 'increasing' : priceTrend < 0 ? 'decreasing' : 'stable',
          recommendedOrderQuantity: Math.max(
            ingredient.lowStockThreshold * 2, // 2x threshold
            supplierOptions[0]?.minimumOrderQuantity || 1
          )
        });
      }
    }

    return recommendations;

  } catch (error) {
    console.error('Error in getLowStockRecommendations:', error);
    return [];
  }
};

// POST /api/supplier/search - Search for ingredients across suppliers
router.post('/search', validateRequest(searchIngredientsSchema), (req, res) => {
  try {
    const { ingredientName, preferredOnly, organicOnly, maxPrice } = req.body;
    
    const results = searchSupplierIngredients(ingredientName, preferredOnly, organicOnly, maxPrice);
    
    return res.json({
      message: `Found ${results.length} supplier options for "${ingredientName}"`,
      ingredientName,
      filters: { preferredOnly, organicOnly, maxPrice },
      results
    });
  } catch (error) {
    console.error('Error in supplier search endpoint:', error);
    return res.status(400).json({ 
      message: 'Failed to search suppliers',
      error: 'Internal server error'
    });
  }
});

// GET /api/supplier/price-history/:ingredientName - Get price history for ingredient
router.get('/price-history/:ingredientName', (req, res) => {
  try {
    const { ingredientName } = req.params;
    const { days = 30 } = req.query;
    
    const history = getPriceHistory(ingredientName, Number(days));
    
    return res.json({
      message: `Price history for "${ingredientName}"`,
      ingredientName,
      days: Number(days),
      history,
      summary: {
        totalRecords: history.length,
        averagePrice: history.length > 0 ? 
          history.reduce((sum, record) => sum + record.pricePerUnit, 0) / history.length : 0,
        priceRange: history.length > 0 ? {
          min: Math.min(...history.map(h => h.pricePerUnit)),
          max: Math.max(...history.map(h => h.pricePerUnit))
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    return res.status(400).json({ message: 'Failed to get price history' });
  }
});

// POST /api/supplier/track-price - Track price change
router.post('/track-price', validateRequest(trackPriceSchema), (req, res) => {
  try {
    const { supplierInventoryId, pricePerUnit } = req.body;
    
    const priceRecord = trackPriceChange(supplierInventoryId, pricePerUnit);
    
    return res.json({
      message: 'Price tracked successfully',
      priceRecord
    });
  } catch (error) {
    console.error('Error tracking price:', error);
    return res.status(400).json({ 
      message: 'Failed to track price',
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// POST /api/supplier/low-stock-recommendations - Get recommendations for low stock items
router.post('/low-stock-recommendations', (req, res) => {
  try {
    const { lowStockIngredients } = req.body;
    
    if (!Array.isArray(lowStockIngredients)) {
      return res.status(400).json({
        message: 'lowStockIngredients must be an array'
      });
    }
    
    const recommendations = getLowStockRecommendations(lowStockIngredients);
    
    return res.json({
      message: `Generated ${recommendations.length} recommendations for low stock items`,
      recommendations,
      summary: {
        totalLowStockItems: lowStockIngredients.length,
        itemsWithRecommendations: recommendations.length,
        totalSupplierOptions: recommendations.reduce((sum, rec) => sum + rec.supplierOptions.length, 0)
      }
    });
  } catch (error) {
    console.error('Error getting low stock recommendations:', error);
    return res.status(400).json({ 
      message: 'Failed to get recommendations',
      error: 'Internal server error'
    });
  }
});

// GET /api/supplier/suppliers - Get all suppliers
router.get('/suppliers', (req, res) => {
  try {
    const { active } = req.query;
    
    let results = suppliers;
    if (active === 'true') {
      results = results.filter(supplier => supplier.isActive);
    }
    
    return res.json({
      message: `Found ${results.length} suppliers`,
      suppliers: results
    });
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return res.status(400).json({ message: 'Failed to get suppliers' });
  }
});

// GET /api/supplier/inventory - Get all supplier inventory
router.get('/inventory', (req, res) => {
  try {
    const { ingredientName, supplierId, organic, preferred } = req.query;
    
    let results = supplierInventory;
    
    if (ingredientName) {
      results = results.filter(item => 
        item.ingredientName.toLowerCase().includes(String(ingredientName).toLowerCase())
      );
    }
    
    if (supplierId) {
      results = results.filter(item => item.supplierId === supplierId);
    }
    
    if (organic === 'true') {
      results = results.filter(item => item.isOrganic);
    }
    
    if (preferred === 'true') {
      results = results.filter(item => item.isPreferred);
    }
    
    // Enrich with supplier information
    const enrichedResults = results.map(item => {
      const supplier = suppliers.find(s => s.id === item.supplierId);
      return {
        ...item,
        supplier: supplier ? {
          id: supplier.id,
          name: supplier.name,
          rating: supplier.rating,
          deliveryTime: supplier.deliveryTime
        } : null
      };
    });
    
    return res.json({
      message: `Found ${enrichedResults.length} inventory items`,
      inventory: enrichedResults
    });
  } catch (error) {
    console.error('Error getting supplier inventory:', error);
    return res.status(400).json({ message: 'Failed to get supplier inventory' });
  }
});

// Export functions for use in other modules
export {
  searchSupplierIngredients,
  getPriceHistory,
  trackPriceChange,
  getLowStockRecommendations
};

export default router; 
