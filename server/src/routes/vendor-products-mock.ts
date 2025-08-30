import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Enhanced mock data storage with recipes and ingredients
let products = [
  {
    id: '1',
    name: 'Handcrafted Wooden Bowl',
    description: 'Beautiful hand-carved wooden bowl made from sustainable oak',
    price: 45.99,
    cost: 25.00,
    profitMargin: 45.6, // Calculated: ((45.99 - 25.00) / 45.99) * 100
    imageUrl: 'https://placekitten.com/400/300',
    tags: ['handmade', 'wooden', 'sustainable', 'artisan'],
    stock: 15,
    isAvailable: true,
    targetMargin: 40,
    recipeId: 'recipe-1',
    onWatchlist: false,
    lastAiSuggestion: 0,
    aiSuggestionNote: '',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    category: 'crafts',
    brand: 'Artisan Woodworks',
    sku: 'WB-001',
    weight: 0.5,
    dimensions: '8" x 8" x 3"',
    rating: 4.8,
    reviewCount: 23,
    salesCount: 45,
    supplier: 'Local Oak Supplier',
    reorderPoint: 5,
    leadTime: 7,
    seasonality: 'year-round',
    status: 'active',
    seoTitle: 'Handcrafted Wooden Bowl - Artisan Made',
    seoDescription: 'Beautiful hand-carved wooden bowl made from sustainable oak',
    seoKeywords: ['wooden bowl', 'handcrafted', 'artisan', 'sustainable'],
    variants: [],
    relatedProducts: [],
    customFields: {},
    // Enhanced Production Fields
    unit: 'piece',
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderQuantity: 20,
    productionLeadTime: 7,
    batchSize: 12,
    productionFrequency: 'weekly',
    allergens: [],
    dietaryRestrictions: [],
    certifications: ['FSC Certified'],
    expirationDays: 3650, // 10 years for wooden items
    storageRequirements: 'Store in a dry place away from direct sunlight',
    isFeatured: true,
    isSeasonal: false,
    hasAllergens: false,
    requiresRefrigeration: false
  },
  {
    id: '2',
    name: 'Ceramic Coffee Mug',
    description: 'Hand-thrown ceramic coffee mug with custom glaze',
    price: 22.50,
    cost: 18.00,
    profitMargin: 20.0, // Calculated: ((22.50 - 18.00) / 22.50) * 100
    imageUrl: 'https://placekitten.com/400/301',
    tags: ['ceramic', 'handmade', 'coffee', 'mug'],
    stock: 8,
    isAvailable: true,
    targetMargin: 25,
    recipeId: 'recipe-2',
    onWatchlist: false,
    lastAiSuggestion: 0,
    aiSuggestionNote: '',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    category: 'crafts',
    brand: 'Pottery Studio',
    sku: 'CM-001',
    weight: 0.3,
    dimensions: '4" x 4" x 5"',
    rating: 4.6,
    reviewCount: 18,
    salesCount: 32,
    supplier: 'Clay Supplier Co.',
    reorderPoint: 3,
    leadTime: 5,
    seasonality: 'year-round',
    status: 'active',
    seoTitle: 'Hand-thrown Ceramic Coffee Mug',
    seoDescription: 'Beautiful hand-thrown ceramic coffee mug with custom glaze',
    seoKeywords: ['ceramic mug', 'handmade', 'coffee', 'pottery'],
    variants: [],
    relatedProducts: [],
    customFields: {},
    // Enhanced Production Fields
    unit: 'piece',
    minStockLevel: 3,
    maxStockLevel: 30,
    reorderQuantity: 15,
    productionLeadTime: 5,
    batchSize: 24,
    productionFrequency: 'bi-weekly',
    allergens: [],
    dietaryRestrictions: [],
    certifications: ['Food Safe'],
    expirationDays: 3650, // 10 years for ceramic items
    storageRequirements: 'Store in a cool, dry place',
    isFeatured: false,
    isSeasonal: false,
    hasAllergens: false,
    requiresRefrigeration: false
  },
  {
    id: '3',
    name: 'Low Margin Test Product',
    description: 'Product with low profit margin for testing',
    price: 10.00,
    cost: 9.00,
    profitMargin: 10.0, // Calculated: ((10.00 - 9.00) / 10.00) * 100
    imageUrl: 'https://placekitten.com/400/302',
    tags: ['test', 'low-margin'],
    stock: 2,
    isAvailable: true,
    targetMargin: 30,
    recipeId: null,
    onWatchlist: true,
    lastAiSuggestion: Date.now(),
    aiSuggestionNote: 'Consider increasing price to improve margin',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    category: 'test',
    brand: 'Test Brand',
    sku: 'TEST-001',
    weight: 0.1,
    dimensions: '2" x 2" x 1"',
    rating: 3.0,
    reviewCount: 2,
    salesCount: 5,
    supplier: 'Test Supplier',
    reorderPoint: 1,
    leadTime: 1,
    seasonality: 'year-round',
    status: 'active',
    seoTitle: 'Test Product',
    seoDescription: 'Test product for development',
    seoKeywords: ['test', 'product'],
    variants: [],
    relatedProducts: [],
    customFields: {},
    // Enhanced Production Fields
    unit: 'piece',
    minStockLevel: 1,
    maxStockLevel: 10,
    reorderQuantity: 5,
    productionLeadTime: 1,
    batchSize: 10,
    productionFrequency: 'on-demand',
    allergens: [],
    dietaryRestrictions: [],
    certifications: [],
    expirationDays: 365,
    storageRequirements: 'Store in a cool, dry place',
    isFeatured: false,
    isSeasonal: false,
    hasAllergens: false,
    requiresRefrigeration: false
  }
];

// Mock recipes data
let recipes = [
  {
    id: 'recipe-1',
    name: 'Classic Sourdough Bread',
    description: 'Traditional sourdough bread with long fermentation',
    instructions: 'Mix ingredients, let rise for 18 hours, shape, proof, bake at 450°F for 45 minutes',
    yield: 2,
    yieldUnit: 'loaves',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'Intermediate',
    isActive: true,
    vendorProfileId: 'mock-vendor-id',
    productId: '1',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    ingredients: [
      {
        id: '1',
        recipeId: 'recipe-1',
        ingredientId: '1',
        ingredientName: 'Organic Flour',
        quantity: 1000,
        unit: 'grams',
        notes: 'High protein bread flour',
        costPerUnit: 0.0035,
        totalCost: 3.50
      },
      {
        id: '2',
        recipeId: 'recipe-1',
        ingredientId: '2',
        ingredientName: 'Water',
        quantity: 750,
        unit: 'grams',
        notes: 'Filtered water at room temperature',
        costPerUnit: 0.0001,
        totalCost: 0.08
      },
      {
        id: '3',
        recipeId: 'recipe-1',
        ingredientId: '3',
        ingredientName: 'Sourdough Starter',
        quantity: 200,
        unit: 'grams',
        notes: 'Active 100% hydration starter',
        costPerUnit: 0.0025,
        totalCost: 0.50
      },
      {
        id: '4',
        recipeId: 'recipe-1',
        ingredientId: '4',
        ingredientName: 'Sea Salt',
        quantity: 20,
        unit: 'grams',
        notes: 'Fine sea salt',
        costPerUnit: 0.008,
        totalCost: 0.16
      }
    ]
  },
  {
    id: 'recipe-2',
    name: 'Artisan Coffee Mug',
    description: 'Hand-thrown ceramic coffee mug with custom glaze',
    instructions: 'Center clay, throw cylinder, shape, trim, glaze, fire to cone 6',
    yield: 1,
    yieldUnit: 'mug',
    prepTime: 45,
    cookTime: 0,
    difficulty: 'Advanced',
    isActive: true,
    vendorProfileId: 'mock-vendor-id',
    productId: '2',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    ingredients: [
      {
        id: '5',
        recipeId: 'recipe-2',
        ingredientId: '5',
        ingredientName: 'Stoneware Clay',
        quantity: 500,
        unit: 'grams',
        notes: 'Cone 6 stoneware clay body',
        costPerUnit: 0.002,
        totalCost: 1.00
      },
      {
        id: '6',
        recipeId: 'recipe-2',
        ingredientId: '6',
        ingredientName: 'Glaze',
        quantity: 100,
        unit: 'grams',
        notes: 'Food-safe cone 6 glaze',
        costPerUnit: 0.015,
        totalCost: 1.50
      }
    ]
  }
];

// Mock ingredients data
let ingredients = [
  {
    id: '1',
    name: 'Organic Flour',
    description: 'High protein bread flour for artisan breads',
    unit: 'grams',
    costPerUnit: 0.0035,
    supplier: 'Local Mill Co.',
    stockQty: 50000,
    lowStockThreshold: 5000,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Water',
    description: 'Filtered water for consistent results',
    unit: 'grams',
    costPerUnit: 0.0001,
    supplier: 'City Water',
    stockQty: 1000000,
    lowStockThreshold: 100000,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sourdough Starter',
    description: 'Active 100% hydration sourdough starter',
    unit: 'grams',
    costPerUnit: 0.0025,
    supplier: 'In-house',
    stockQty: 2000,
    lowStockThreshold: 500,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Sea Salt',
    description: 'Fine sea salt for bread making',
    unit: 'grams',
    costPerUnit: 0.008,
    supplier: 'Salt Co.',
    stockQty: 5000,
    lowStockThreshold: 1000,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Stoneware Clay',
    description: 'Cone 6 stoneware clay body',
    unit: 'grams',
    costPerUnit: 0.002,
    supplier: 'Clay Supplier Co.',
    stockQty: 25000,
    lowStockThreshold: 2500,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Glaze',
    description: 'Food-safe cone 6 glaze',
    unit: 'grams',
    costPerUnit: 0.015,
    supplier: 'Glaze World',
    stockQty: 5000,
    lowStockThreshold: 500,
    isAvailable: true,
    vendorProfileId: 'mock-vendor-id',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z'
  }
];

// Mock production batches
let productionBatches = [
  {
    id: 'batch-1',
    productId: '1',
    productName: 'Handcrafted Wooden Bowl',
    batchSize: 12,
    startDate: '2025-08-27T08:00:00Z',
    completionDate: '2025-08-27T16:00:00Z',
    status: 'completed',
    ingredientsUsed: [
      { ingredientId: '1', ingredientName: 'Oak Wood', quantity: 24, unit: 'board feet', cost: 48.00 },
      { ingredientId: '2', ingredientName: 'Wood Finish', quantity: 2, unit: 'quarts', cost: 15.00 }
    ],
    totalCost: 63.00,
    notes: 'High quality batch, excellent grain patterns'
  },
  {
    id: 'batch-2',
    productId: '2',
    productName: 'Ceramic Coffee Mug',
    batchSize: 24,
    startDate: '2025-08-28T09:00:00Z',
    status: 'in-progress',
    ingredientsUsed: [
      { ingredientId: '5', ingredientName: 'Stoneware Clay', quantity: 12000, unit: 'grams', cost: 24.00 },
      { ingredientId: '6', ingredientName: 'Glaze', quantity: 2400, unit: 'grams', cost: 36.00 }
    ],
    totalCost: 60.00,
    notes: 'Standard production run'
  }
];

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  cost: z.number().min(0, 'Cost must be non-negative').optional(),
  imageUrl: z.string().url('Must be a valid URL').optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().min(0, 'Stock must be non-negative'),
  isAvailable: z.boolean().default(true),
  targetMargin: z.number().min(0, 'Target margin must be non-negative').max(100, 'Target margin cannot exceed 100%').optional(),
  recipeId: z.string().optional(),
  onWatchlist: z.boolean().default(false),
  lastAiSuggestion: z.number().optional(),
  aiSuggestionNote: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().optional(),
  supplier: z.string().optional(),
  reorderPoint: z.number().min(0).optional(),
  leadTime: z.number().min(0).optional(),
  seasonality: z.enum(['year-round', 'seasonal', 'limited']).optional(),
  status: z.enum(['active', 'draft', 'archived', 'discontinued']).optional(),
  // Enhanced Production Fields
  unit: z.string().optional(),
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  productionLeadTime: z.number().min(0).optional(),
  batchSize: z.number().min(1).optional(),
  productionFrequency: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'on-demand']).optional(),
  allergens: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  expirationDays: z.number().min(1).optional(),
  storageRequirements: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  hasAllergens: z.boolean().optional(),
  requiresRefrigeration: z.boolean().optional()
});

const updateProductSchema = createProductSchema.partial();

// Middleware to check if user is vendor owner or admin
const isVendorOwnerOrAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session.userId === 'mock-user-id' || req.session.userId === 'dev-user-id') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
};

// GET /api/vendor/products - Get all products for the vendor
router.get('/', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const { search, category, status, priceRange, stockStatus } = req.query;
    
    let filteredProducts = [...products];
    
    // Apply filters
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    if (status) {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }
    
    if (priceRange) {
      const range = priceRange as any;
      if (range.min !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price >= parseFloat(range.min));
      }
      if (range.max !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price <= parseFloat(range.max));
      }
    }
    
    if (stockStatus) {
      if (stockStatus === 'low') {
        filteredProducts = filteredProducts.filter(product => 
          product.stock <= (product.minStockLevel || 10)
        );
      } else if (stockStatus === 'out') {
        filteredProducts = filteredProducts.filter(product => product.stock === 0);
      }
    }
    
    res.json({
      products: filteredProducts,
      count: filteredProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/products - Create a new product
router.post('/', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    
    const newProduct = {
      id: `product-${Date.now()}`,
      ...validatedData,
      profitMargin: validatedData.cost && validatedData.price 
        ? ((validatedData.price - validatedData.cost) / validatedData.price) * 100 
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.flatten()
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/products/:id - Get a specific product
router.get('/:id', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/vendor/products/:id - Update a product
router.put('/:id', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const validatedData = updateProductSchema.parse(req.body);
    
    const updatedProduct = {
      ...products[productIndex],
      ...validatedData,
      profitMargin: validatedData.cost && validatedData.price 
        ? ((validatedData.price - validatedData.cost) / validatedData.price) * 100 
        : products[productIndex].profitMargin,
      updatedAt: new Date().toISOString()
    };
    
    products[productIndex] = updatedProduct;
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.flatten()
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/vendor/products/:id - Delete a product
router.delete('/:id', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/products/:id/ai-suggestion - Get AI suggestion for a product
router.get('/:id/ai-suggestion', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Mock AI suggestion logic
    const suggestions = [];
    
    if (product.profitMargin && product.profitMargin < 20) {
      suggestions.push({
        type: 'pricing',
        title: 'Low Profit Margin Alert',
        description: 'Your profit margin is below the recommended 20% threshold',
        impact: 'high',
        confidence: 0.95,
        implementation: [
          'Review your cost structure',
          'Consider increasing the selling price',
          'Look for cheaper suppliers or bulk discounts'
        ]
      });
    }
    
    if (product.stock <= (product.minStockLevel || 5)) {
      suggestions.push({
        type: 'inventory',
        title: 'Low Stock Warning',
        description: 'Your current stock is below the minimum threshold',
        impact: 'medium',
        confidence: 0.90,
        implementation: [
          'Place a reorder immediately',
          'Consider increasing your reorder quantity',
          'Review your demand forecasting'
        ]
      });
    }
    
    if (product.rating && product.rating < 4.0) {
      suggestions.push({
        type: 'marketing',
        title: 'Customer Satisfaction Improvement',
        description: 'Your product rating could be improved',
        impact: 'medium',
        confidence: 0.85,
        implementation: [
          'Review customer feedback',
          'Improve product quality',
          'Enhance customer service'
        ]
      });
    }
    
    res.json({
      productId: product.id,
      suggestions: suggestions.length > 0 ? suggestions : [{
        type: 'general',
        title: 'Product Performing Well',
        description: 'Your product is meeting expectations',
        impact: 'low',
        confidence: 0.80,
        implementation: ['Continue current practices', 'Monitor for changes']
      }]
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/products/:id/ai-suggest - Apply AI suggestion to a product
router.post('/:id/ai-suggest', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[productIndex];
    
    // Mock AI suggestion application
    const updatedProduct = {
      ...product,
      lastAiSuggestion: Date.now(),
      aiSuggestionNote: 'AI suggestions applied successfully',
      updatedAt: new Date().toISOString()
    };
    
    // Apply some common AI suggestions
    if (product.profitMargin && product.profitMargin < 20) {
      updatedProduct.price = Math.round((product.cost || 0) / 0.7 * 100) / 100; // Target 30% margin
      updatedProduct.profitMargin = ((updatedProduct.price - (product.cost || 0)) / updatedProduct.price) * 100;
    }
    
    if (product.stock <= (product.minStockLevel || 5)) {
      updatedProduct.stock = (product.reorderQuantity || 10) + product.stock;
    }
    
    products[productIndex] = updatedProduct;
    
    res.json({
      message: 'AI suggestions applied successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/products/:id/margin - Get margin analysis for a product
router.get('/:id/margin', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const recipe = product.recipeId ? recipes.find(r => r.id === product.recipeId) : null;
    
    const marginAnalysis = {
      productId: product.id,
      productName: product.name,
      currentPrice: product.price,
      costPrice: product.cost || 0,
      currentMargin: product.profitMargin || 0,
      targetMargin: product.targetMargin || 30,
      marginDifference: (product.targetMargin || 30) - (product.profitMargin || 0),
      recommendations: [],
      costBreakdown: []
    };
    
    if (recipe) {
      // Calculate cost breakdown from recipe
      recipe.ingredients.forEach(ingredient => {
        marginAnalysis.costBreakdown.push({
          ingredient: ingredient.ingredientName,
          cost: ingredient.totalCost,
          percentage: ((ingredient.totalCost / (product.cost || 1)) * 100)
        });
      });
      
      // Add recipe-based recommendations
      if (marginAnalysis.currentMargin < marginAnalysis.targetMargin) {
        marginAnalysis.recommendations.push(
          'Consider increasing the selling price to meet your target margin',
          'Review ingredient costs and look for bulk purchase opportunities',
          'Optimize your recipe to reduce ingredient waste'
        );
      }
    } else {
      marginAnalysis.recommendations.push(
        'Link this product to a recipe for detailed cost analysis',
        'Consider setting up ingredient tracking for better cost control'
      );
    }
    
    res.json(marginAnalysis);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/recipes - Get all recipes for the vendor
router.get('/recipes', isVendorOwnerOrAdmin, (req, res) => {
  try {
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/ingredients - Get all ingredients for the vendor
router.get('/ingredients', isVendorOwnerOrAdmin, (req, res) => {
  try {
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vendor/production-batches - Get all production batches for the vendor
router.get('/production-batches', isVendorOwnerOrAdmin, (req, res) => {
  try {
    res.json(productionBatches);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/upload/image - Mock image upload endpoint
router.post('/upload/image', isVendorOwnerOrAdmin, (req, res) => {
  try {
    // Mock image upload - in real app, this would handle file upload
    const mockImageUrl = `https://placekitten.com/400/300?random=${Date.now()}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: mockImageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/upload/document - Mock document upload endpoint
router.post('/upload/document', isVendorOwnerOrAdmin, (req, res) => {
  try {
    // Mock document upload - in real app, this would handle file upload
    const mockDocumentUrl = `https://example.com/documents/uploaded-${Date.now()}.pdf`;
    
    res.json({
      message: 'Document uploaded successfully',
      documentUrl: mockDocumentUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/ai/analyze-image - Mock AI image analysis endpoint
router.post('/ai/analyze-image', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    // Mock AI image analysis
    const analysis = {
      imageUrl,
      detectedObjects: ['bowl', 'wood', 'handcrafted'],
      suggestedTags: ['artisan', 'handmade', 'wooden', 'bowl', 'sustainable'],
      suggestedCategory: 'crafts',
      suggestedDescription: 'Beautiful handcrafted wooden bowl with natural grain patterns',
      confidence: 0.92
    };
    
    res.json({
      message: 'Image analyzed successfully',
      analysis
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vendor/ai/process-document - Mock AI document processing endpoint
router.post('/ai/process-document', isVendorOwnerOrAdmin, (req, res) => {
  try {
    const { documentUrl, documentType } = req.body;
    
    // Mock document processing
    const processedData = {
      documentUrl,
      documentType,
      extractedProducts: [
        {
          name: 'Artisan Bread',
          description: 'Fresh baked artisan bread',
          suggestedPrice: 8.99,
          suggestedCategory: 'food',
          confidence: 0.89
        },
        {
          name: 'Handmade Soap',
          description: 'Natural handmade soap',
          suggestedPrice: 6.50,
          suggestedCategory: 'crafts',
          confidence: 0.85
        }
      ],
      totalProducts: 2
    };
    
    res.json({
      message: 'Document processed successfully',
      processedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 
