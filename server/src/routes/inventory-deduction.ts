import express from 'express';
import { z } from 'zod';

// Import supplier marketplace functions
import { searchSupplierIngredients, getLowStockRecommendations } from './supplier-marketplace';

const router = express.Router();

// Mock data storage (in a real app, this would be database queries)
let ingredients = [
  {
    id: '1',
    name: 'Organic Flour',
    description: 'High-quality organic all-purpose flour',
    unit: 'kilograms',
    costPerUnit: 3.50,
    supplier: 'Local Market',
    stockQty: 25.0,
    lowStockThreshold: 5.0,
    isAvailable: true,
    vendorProfileId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fresh Eggs',
    description: 'Farm-fresh organic eggs',
    unit: 'pieces',
    costPerUnit: 0.75,
    supplier: 'Farm Fresh Co.',
    stockQty: 48,
    lowStockThreshold: 12,
    isAvailable: true,
    vendorProfileId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Vanilla Extract',
    description: 'Pure vanilla extract',
    unit: 'bottles',
    costPerUnit: 12.00,
    supplier: 'Spice World',
    stockQty: 3,
    lowStockThreshold: 5,
    isAvailable: true,
    vendorProfileId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Butter',
    description: 'Unsalted butter',
    unit: 'pounds',
    costPerUnit: 4.25,
    supplier: 'Dairy Delights',
    stockQty: 8.5,
    lowStockThreshold: 3,
    isAvailable: true,
    vendorProfileId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Sugar',
    description: 'Granulated white sugar',
    unit: 'pounds',
    costPerUnit: 2.50,
    supplier: 'Sweet Supplies',
    stockQty: 2.5,
    lowStockThreshold: 5,
    isAvailable: true,
    vendorProfileId: 'vendor-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let recipes = [
  {
    id: '1',
    name: 'Chocolate Chip Cookies',
    description: 'Classic homemade chocolate chip cookies',
    instructions: '1. Preheat oven to 375°F\n2. Mix dry ingredients\n3. Cream butter and sugar\n4. Add eggs and vanilla\n5. Combine wet and dry ingredients\n6. Drop by spoonfuls onto baking sheet\n7. Bake for 10-12 minutes',
    yield: 24,
    yieldUnit: 'cookies',
    prepTime: 15,
    cookTime: 12,
    difficulty: 'Easy',
    isActive: true,
    vendorProfileId: 'vendor-1',
    productId: 'product-1', // Linked to a product
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sourdough Bread',
    description: 'Traditional sourdough bread with crispy crust',
    instructions: '1. Feed starter\n2. Mix dough\n3. Bulk ferment\n4. Shape\n5. Final proof\n6. Score and bake',
    yield: 1,
    yieldUnit: 'loaf',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'Hard',
    isActive: true,
    vendorProfileId: 'vendor-1',
    productId: 'product-2', // Linked to another product
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let recipeIngredients = [
  {
    id: '1',
    recipeId: '1',
    ingredientId: '1', // Organic Flour
    quantity: 2.5,
    unit: 'cups',
    notes: 'All-purpose flour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    recipeId: '1',
    ingredientId: '2', // Fresh Eggs
    quantity: 2,
    unit: 'pieces',
    notes: 'Room temperature',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    recipeId: '1',
    ingredientId: '4', // Butter
    quantity: 1,
    unit: 'cup',
    notes: 'Softened',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    recipeId: '2',
    ingredientId: '1', // Organic Flour
    quantity: 4,
    unit: 'cups',
    notes: 'Bread flour preferred',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Validation schema for inventory deduction
const deductInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantitySold: z.number().min(1, 'Quantity sold must be at least 1')
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
          errors: error.flatten()
        });
      }
      return res.status(400).json({ message: 'Invalid request data' });
    }
  };
};

/**
 * Deduct inventory when products are sold
 * @param productId - The ID of the product being sold
 * @param quantitySold - The quantity of the product being sold
 * @returns Object containing success status, deducted ingredients, and low stock alerts
 */
const deductInventory = (productId: string, quantitySold: number) => {
  try {
    // Step 1: Find the recipe linked to this product
    const linkedRecipe = recipes.find(recipe => recipe.productId === productId);
    
    if (!linkedRecipe) {
      return {
        success: false,
        error: 'No recipe found for this product',
        deductedIngredients: [],
        lowStockAlerts: []
      };
    }

    // Step 2: Get all ingredients for this recipe
    const recipeIngredientList = recipeIngredients.filter(ri => ri.recipeId === linkedRecipe.id);
    
    if (recipeIngredientList.length === 0) {
      return {
        success: false,
        error: 'No ingredients found for this recipe',
        deductedIngredients: [],
        lowStockAlerts: []
      };
    }

    const deductedIngredients = [];
    const lowStockAlerts = [];

    // Step 3: Calculate and deduct ingredients for each batch
    for (let batch = 0; batch < quantitySold; batch++) {
      for (const recipeIngredient of recipeIngredientList) {
        // Find the actual ingredient
        const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
        
        if (!ingredient) {
          continue; // Skip if ingredient not found
        }

        // Calculate quantity to deduct (convert units if necessary)
        let quantityToDeduct = recipeIngredient.quantity;
        
        // Simple unit conversion (in a real app, you'd have a more sophisticated conversion system)
        if (recipeIngredient.unit !== ingredient.unit) {
          // Basic conversions - in production, you'd want a proper unit conversion system
          if (recipeIngredient.unit === 'cups' && ingredient.unit === 'kilograms') {
            quantityToDeduct = recipeIngredient.quantity * 0.125; // Approximate conversion
          } else if (recipeIngredient.unit === 'cup' && ingredient.unit === 'pounds') {
            quantityToDeduct = recipeIngredient.quantity * 0.5; // Approximate conversion
          }
          // Add more conversions as needed
        }

        // Check if we have enough stock
        if (ingredient.stockQty < quantityToDeduct) {
          return {
            success: false,
            error: `Insufficient stock for ${ingredient.name}. Required: ${quantityToDeduct} ${ingredient.unit}, Available: ${ingredient.stockQty} ${ingredient.unit}`,
            deductedIngredients: [],
            lowStockAlerts: []
          };
        }

        // Deduct the quantity
        ingredient.stockQty -= quantityToDeduct;
        ingredient.updatedAt = new Date().toISOString();

                 // Check if stock is now below threshold
         if (ingredient.stockQty <= ingredient.lowStockThreshold) {
           const existingAlert = lowStockAlerts.find(alert => alert.ingredientId === ingredient.id);
           if (!existingAlert) {
             // Get supplier recommendations for this ingredient
             const supplierOptions = searchSupplierIngredients(ingredient.name, false, false);
             const topSuppliers = supplierOptions.slice(0, 3); // Top 3 options
             
             lowStockAlerts.push({
               ingredientId: ingredient.id,
               ingredientName: ingredient.name,
               currentStock: ingredient.stockQty,
               lowStockThreshold: ingredient.lowStockThreshold,
               unit: ingredient.unit,
               supplier: ingredient.supplier,
               supplierRecommendations: topSuppliers.map(option => ({
                 supplierId: option.supplier?.id,
                 supplierName: option.supplier?.name,
                 brand: option.brand,
                 pricePerUnit: option.pricePerUnit,
                 availableQuantity: option.availableQuantity,
                 minimumOrderQuantity: option.minimumOrderQuantity,
                 isOrganic: option.isOrganic,
                 isPreferred: option.isPreferred,
                 deliveryTime: option.supplier?.deliveryTime,
                 rating: option.supplier?.rating
               }))
             });
           }
         }

        // Track what was deducted
        const existingDeduction = deductedIngredients.find(d => d.ingredientId === ingredient.id);
        if (existingDeduction) {
          existingDeduction.quantityDeducted += quantityToDeduct;
        } else {
          deductedIngredients.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            quantityDeducted: quantityToDeduct,
            unit: ingredient.unit,
            remainingStock: ingredient.stockQty
          });
        }
      }
    }

    return {
      success: true,
      message: `Successfully deducted inventory for ${quantitySold} units of product`,
      recipeName: linkedRecipe.name,
      deductedIngredients,
      lowStockAlerts
    };

  } catch (error) {
    console.error('Error in deductInventory:', error);
    return {
      success: false,
      error: 'Internal server error during inventory deduction',
      deductedIngredients: [],
      lowStockAlerts: []
    };
  }
};

// POST /api/inventory/deduct - Deduct inventory for sold products
router.post('/deduct', validateRequest(deductInventorySchema), (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    
    const result = deductInventory(productId, quantitySold);
    
    if (result.success) {
      return res.status(400).json({
        message: result.message,
        recipeName: result.recipeName,
        deductedIngredients: result.deductedIngredients,
        lowStockAlerts: result.lowStockAlerts
      });
    } else {
      return res.status(400).json({
        message: result.error,
        deductedIngredients: result.deductedIngredients,
        lowStockAlerts: result.lowStockAlerts
      });
    }
  } catch (error) {
    console.error('Error in deduct inventory endpoint:', error);
    return res.status(400).json({ 
      message: 'Failed to deduct inventory',
      error: 'Internal server error'
    });
  }
});

// GET /api/inventory/status - Get current inventory status
router.get('/status', (req, res) => {
  try {
    const inventoryStatus = ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      currentStock: ingredient.stockQty,
      lowStockThreshold: ingredient.lowStockThreshold,
      unit: ingredient.unit,
      isLowStock: ingredient.stockQty <= ingredient.lowStockThreshold,
      supplier: ingredient.supplier
    }));

    const lowStockItems = inventoryStatus.filter(item => item.isLowStock);

    return res.json({
      message: 'Inventory status retrieved successfully',
      totalIngredients: inventoryStatus.length,
      lowStockCount: lowStockItems.length,
      inventoryStatus,
      lowStockItems
    });
  } catch (error) {
    console.error('Error getting inventory status:', error);
    return res.status(400).json({ message: 'Failed to get inventory status' });
  }
});

// GET /api/inventory/recipes - Get all recipes with their linked products
router.get('/recipes', (req, res) => {
  try {
    const recipesWithProducts = recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      productId: recipe.productId,
      yield: recipe.yield,
      yieldUnit: recipe.yieldUnit,
      ingredients: recipeIngredients
        .filter(ri => ri.recipeId === recipe.id)
        .map(ri => {
          const ingredient = ingredients.find(ing => ing.id === ri.ingredientId);
          return {
            ingredientId: ri.ingredientId,
            ingredientName: ingredient?.name || 'Unknown',
            quantity: ri.quantity,
            unit: ri.unit,
            currentStock: ingredient?.stockQty || 0,
            lowStockThreshold: ingredient?.lowStockThreshold || 0
          };
        })
    }));

    return res.json({
      message: 'Recipes with inventory information retrieved successfully',
      recipes: recipesWithProducts
    });
  } catch (error) {
    console.error('Error getting recipes with inventory:', error);
    return res.status(400).json({ message: 'Failed to get recipes with inventory' });
  }
});

// POST /api/inventory/low-stock-recommendations - Get comprehensive recommendations for low stock items
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
        totalSupplierOptions: recommendations.reduce((sum, rec) => sum + rec.supplierOptions.length, 0),
        averagePriceTrend: recommendations.length > 0 ? 
          recommendations.reduce((sum, rec) => sum + rec.priceTrend, 0) / recommendations.length : 0
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

export default router; 
