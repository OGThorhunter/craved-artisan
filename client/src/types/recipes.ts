// Recipe and Ingredient type definitions for Phase 3

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: string; // grams, ounces, cups, pieces, etc.
  costPerUnit: number;
  costUnit: string; // per gram, per ounce, per cup, etc.
  supplier?: string;
  category: string; // flour, sugar, dairy, spices, etc.
  isAvailable: boolean;
  minStockLevel: number;
  currentStock: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  notes?: string;
  isOptional: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // prep + cook
  servings: number;
  yield: number; // final product quantity
  yieldUnit: string; // pieces, loaves, etc.
  instructions: string[];
  ingredients: RecipeIngredient[];
  tags: string[];
  imageUrl?: string;
  isActive: boolean;
  version: number;
  parentRecipeId?: string; // for versioning
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeForm {
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  yield: number;
  yieldUnit: string;
  instructions: string[];
  ingredients: CreateRecipeIngredientForm[];
  tags: string;
  imageUrl: string;
}

export interface CreateRecipeIngredientForm {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes: string;
  isOptional: boolean;
}

export interface CreateIngredientForm {
  name: string;
  description: string;
  unit: string;
  costPerUnit: number;
  costUnit: string;
  supplier: string;
  category: string;
  minStockLevel: number;
  currentStock: number;
  reorderPoint: number;
}

export interface RecipeCostAnalysis {
  recipeId: string;
  recipeName: string;
  totalCost: number;
  costPerServing: number;
  costPerYield: number;
  ingredientBreakdown: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    cost: number;
    percentageOfTotal: number;
  }[];
  marginAnalysis: {
    suggestedPrice: number;
    targetMargin: number;
    profitPerServing: number;
    profitPerYield: number;
    breakEvenPrice: number;
  };
  lastCalculated: string;
}

export interface ProductionPlan {
  id: string;
  recipeId: string;
  recipe: Recipe;
  batchSize: number;
  plannedDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  ingredientRequirements: {
    ingredientId: string;
    ingredient: Ingredient;
    requiredQuantity: number;
    availableQuantity: number;
    needsPurchase: boolean;
    purchaseQuantity: number;
  }[];
  estimatedCost: number;
  estimatedYield: number;
  actualYield?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductionPlanForm {
  recipeId: string;
  batchSize: number;
  plannedDate: string;
  notes: string;
}

// Mock data for development
export const MOCK_INGREDIENT_CATEGORIES = [
  'Flour & Grains',
  'Sugar & Sweeteners',
  'Dairy & Eggs',
  'Fruits & Vegetables',
  'Meat & Seafood',
  'Spices & Herbs',
  'Nuts & Seeds',
  'Oils & Fats',
  'Baking Essentials',
  'Other'
];

export const MOCK_RECIPE_CATEGORIES = [
  'Bread & Pastries',
  'Cakes & Desserts',
  'Savory Dishes',
  'Beverages',
  'Preserves & Jams',
  'Sauces & Condiments',
  'Snacks & Appetizers',
  'Soups & Stews',
  'Salads & Sides',
  'Other'
];

export const MOCK_UNITS = [
  'grams (g)',
  'ounces (oz)',
  'pounds (lb)',
  'kilograms (kg)',
  'cups',
  'tablespoons (tbsp)',
  'teaspoons (tsp)',
  'fluid ounces (fl oz)',
  'milliliters (ml)',
  'liters (L)',
  'pieces',
  'slices',
  'pinches',
  'dashes'
];

export const MOCK_COST_UNITS = [
  'per kg',
  'per lb',
  'per gram',
  'per ounce',
  'per liter',
  'per gallon',
  'per piece',
  'per dozen'
];

// Mock ingredient data for Phase 4
export const MOCK_INGREDIENTS = [
  {
    id: '1',
    name: 'All-Purpose Flour',
    description: 'High-quality wheat flour for baking',
    category: 'Dry Goods',
    unit: 'kg',
    costPerUnit: 2.50,
    costUnit: 'per kg',
    supplier: 'Local Mill Co.',
    minStock: 10,
    currentStock: 25,
    lastUpdated: '2025-08-30'
  },
  {
    id: '2',
    name: 'Fresh Eggs',
    description: 'Farm-fresh large eggs',
    category: 'Dairy & Eggs',
    unit: 'dozen',
    costPerUnit: 4.80,
    costUnit: 'per dozen',
    supplier: 'Sunny Valley Farms',
    minStock: 5,
    currentStock: 8,
    lastUpdated: '2025-08-29'
  },
  {
    id: '3',
    name: 'Unsalted Butter',
    description: 'Premium butter for baking',
    category: 'Dairy & Eggs',
    unit: 'kg',
    costPerUnit: 8.50,
    costUnit: 'per kg',
    supplier: 'Golden Dairy',
    minStock: 3,
    currentStock: 4.5,
    lastUpdated: '2025-08-28'
  },
  {
    id: '4',
    name: 'Granulated Sugar',
    description: 'Fine white sugar for baking',
    category: 'Dry Goods',
    unit: 'kg',
    costPerUnit: 1.80,
    costUnit: 'per kg',
    supplier: 'Sweet Supply Co.',
    minStock: 15,
    currentStock: 20,
    lastUpdated: '2025-08-30'
  },
  {
    id: '5',
    name: 'Active Dry Yeast',
    description: 'Professional baking yeast',
    category: 'Leavening',
    unit: 'gram',
    costPerUnit: 0.15,
    costUnit: 'per gram',
    supplier: 'Baker\'s Choice',
    minStock: 100,
    currentStock: 150,
    lastUpdated: '2025-08-27'
  }
];

export const MOCK_INGREDIENT_CATEGORIES_PHASE4 = [
  'Dry Goods',
  'Dairy & Eggs',
  'Leavening',
  'Sweeteners',
  'Fats & Oils',
  'Fresh Produce',
  'Spices & Herbs',
  'Nuts & Seeds',
  'Other'
];

// Enhanced recipe data with ingredient links for Phase 5
export const MOCK_RECIPES_WITH_INGREDIENTS = [
  {
    id: '1',
    name: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread with crispy crust and tangy flavor',
    category: 'Bread & Pastries',
    difficulty: 'hard',
    prepTime: 30,
    cookTime: 45,
    totalTime: 75,
    servings: 8,
    yield: 1,
    yieldUnit: 'loaf',
    instructions: [
      'Mix flour, water, and starter',
      'Knead for 10 minutes',
      'Let rise for 4 hours',
      'Shape and bake at 450°F'
    ],
    ingredients: [
      {
        id: '1',
        ingredientId: '1',
        ingredient: MOCK_INGREDIENTS[0], // All-Purpose Flour
        quantity: 3.5,
        unit: 'kg',
        notes: 'High protein content preferred',
        isOptional: false
      },
      {
        id: '2',
        ingredientId: '2',
        ingredient: MOCK_INGREDIENTS[1], // Fresh Eggs
        quantity: 2,
        unit: 'dozen',
        notes: 'Room temperature',
        isOptional: false
      },
      {
        id: '3',
        ingredientId: '5',
        ingredient: MOCK_INGREDIENTS[4], // Active Dry Yeast
        quantity: 15,
        unit: 'gram',
        notes: 'Activate in warm water',
        isOptional: false
      }
    ],
    tags: ['bread', 'sourdough', 'artisan'],
    imageUrl: '',
    isActive: true,
    version: 1,
    createdBy: 'dev-user-id',
    createdAt: '2025-08-30',
    updatedAt: '2025-08-30'
  },
  {
    id: '2',
    name: 'Classic Chocolate Chip Cookies',
    description: 'Soft and chewy cookies with chocolate chips',
    category: 'Cakes & Desserts',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    servings: 24,
    yield: 24,
    yieldUnit: 'cookies',
    instructions: [
      'Cream butter and sugar',
      'Add eggs and vanilla',
      'Mix in flour and chocolate chips',
      'Bake at 375°F for 10-12 minutes'
    ],
    ingredients: [
      {
        id: '4',
        ingredientId: '1',
        ingredient: MOCK_INGREDIENTS[0], // All-Purpose Flour
        quantity: 2.5,
        unit: 'kg',
        notes: 'Sifted',
        isOptional: false
      },
      {
        id: '5',
        ingredientId: '3',
        ingredient: MOCK_INGREDIENTS[2], // Unsalted Butter
        quantity: 1,
        unit: 'kg',
        notes: 'Softened',
        isOptional: false
      },
      {
        id: '6',
        ingredientId: '4',
        ingredient: MOCK_INGREDIENTS[3], // Granulated Sugar
        quantity: 1.5,
        unit: 'kg',
        notes: 'Fine grain',
        isOptional: false
      }
    ],
    tags: ['cookies', 'chocolate', 'dessert'],
    imageUrl: '',
    isActive: true,
    version: 1,
    createdBy: 'dev-user-id',
    createdAt: '2025-08-30',
    updatedAt: '2025-08-30'
  }
];

// Cost analysis calculation functions
export const calculateRecipeCost = (recipe: any, ingredients: any[]) => {
  let totalCost = 0;
  const breakdown: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    cost: number;
    percentageOfTotal: number;
  }> = [];

  recipe.ingredients.forEach((recipeIngredient: any) => {
    const ingredient = ingredients.find(i => i.id === recipeIngredient.ingredientId);
    if (ingredient) {
      // Convert units if needed (simplified for now)
      let cost = ingredient.costPerUnit * recipeIngredient.quantity;
      
      // Handle different units (basic conversion)
      if (ingredient.unit === 'kg' && recipeIngredient.unit === 'gram') {
        cost = ingredient.costPerUnit * (recipeIngredient.quantity / 1000);
      } else if (ingredient.unit === 'gram' && recipeIngredient.unit === 'kg') {
        cost = ingredient.costPerUnit * (recipeIngredient.quantity * 1000);
      }

      totalCost += cost;
      breakdown.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        cost: cost,
        percentageOfTotal: 0 // Will be calculated after total
      });
    }
  });

  // Calculate percentages
  breakdown.forEach(item => {
    item.percentageOfTotal = totalCost > 0 ? (item.cost / totalCost) * 100 : 0;
  });

  return {
    totalCost,
    breakdown,
    costPerServing: totalCost / recipe.servings,
    costPerYield: totalCost / recipe.yield
  };
};

export const calculateMarginAnalysis = (totalCost: number, targetMargin: number = 30) => {
  const marginMultiplier = 1 + (targetMargin / 100);
  const suggestedPrice = totalCost * marginMultiplier;
  const profitPerUnit = suggestedPrice - totalCost;
  const breakEvenPrice = totalCost;

  return {
    suggestedPrice,
    targetMargin,
    profitPerUnit,
    breakEvenPrice
  };
};

// Production planning mock data for Phase 6
export const MOCK_PRODUCTION_PLANS = [
  {
    id: '1',
    recipeId: '1',
    recipe: MOCK_RECIPES_WITH_INGREDIENTS[0], // Artisan Sourdough Bread
    batchSize: 5,
    plannedDate: '2025-09-02',
    status: 'planned',
    ingredientRequirements: [
      {
        ingredientId: '1',
        ingredient: MOCK_INGREDIENTS[0], // All-Purpose Flour
        requiredQuantity: 17.5, // 3.5kg * 5 batches
        availableQuantity: 25,
        needsPurchase: false,
        purchaseQuantity: 0
      },
      {
        ingredientId: '2',
        ingredient: MOCK_INGREDIENTS[1], // Fresh Eggs
        requiredQuantity: 10, // 2 dozen * 5 batches
        availableQuantity: 8,
        needsPurchase: true,
        purchaseQuantity: 2
      },
      {
        ingredientId: '5',
        ingredient: MOCK_INGREDIENTS[4], // Active Dry Yeast
        requiredQuantity: 75, // 15g * 5 batches
        availableQuantity: 150,
        needsPurchase: false,
        purchaseQuantity: 0
      }
    ],
    estimatedCost: 0, // Will be calculated
    estimatedYield: 5,
    actualYield: undefined,
    actualCost: undefined,
    notes: 'Weekly bread production for local market',
    createdAt: '2025-08-30',
    updatedAt: '2025-08-30'
  },
  {
    id: '2',
    recipeId: '2',
    recipe: MOCK_RECIPES_WITH_INGREDIENTS[1], // Classic Chocolate Chip Cookies
    batchSize: 3,
    plannedDate: '2025-09-01',
    status: 'in-progress',
    ingredientRequirements: [
      {
        ingredientId: '1',
        ingredient: MOCK_INGREDIENTS[0], // All-Purpose Flour
        requiredQuantity: 7.5, // 2.5kg * 3 batches
        availableQuantity: 25,
        needsPurchase: false,
        purchaseQuantity: 0
      },
      {
        ingredientId: '3',
        ingredient: MOCK_INGREDIENTS[2], // Unsalted Butter
        requiredQuantity: 3, // 1kg * 3 batches
        availableQuantity: 4.5,
        needsPurchase: false,
        purchaseQuantity: 0
      },
      {
        ingredientId: '4',
        ingredient: MOCK_INGREDIENTS[3], // Granulated Sugar
        requiredQuantity: 4.5, // 1.5kg * 3 batches
        availableQuantity: 20,
        needsPurchase: false,
        purchaseQuantity: 0
      }
    ],
    estimatedCost: 0, // Will be calculated
    estimatedYield: 72,
    actualYield: undefined,
    actualCost: undefined,
    notes: 'Cookie production for weekend market',
    createdAt: '2025-08-30',
    updatedAt: '2025-08-30'
  }
];

// Production planning calculation functions
export const calculateProductionRequirements = (recipe: any, batchSize: number, ingredients: any[]) => {
  const requirements = recipe.ingredients.map((recipeIngredient: any) => {
    const ingredient = ingredients.find(i => i.id === recipeIngredient.ingredientId);
    if (ingredient) {
      const requiredQuantity = recipeIngredient.quantity * batchSize;
      const availableQuantity = ingredient.currentStock;
      const needsPurchase = requiredQuantity > availableQuantity;
      const purchaseQuantity = needsPurchase ? requiredQuantity - availableQuantity : 0;

      return {
        ingredientId: ingredient.id,
        ingredient: ingredient,
        requiredQuantity,
        availableQuantity,
        needsPurchase,
        purchaseQuantity
      };
    }
    return null;
  }).filter(Boolean);

  return requirements;
};

export const calculateProductionCost = (recipe: any, batchSize: number, ingredients: any[]) => {
  const costData = calculateRecipeCost(recipe, ingredients);
  return costData.totalCost * batchSize;
};

export const getProductionStatusColor = (status: string) => {
  switch (status) {
    case 'planned': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getProductionStatusIcon = (status: string) => {
  switch (status) {
    case 'planned': return '📅';
    case 'in-progress': return '⚡';
    case 'completed': return '✅';
    case 'cancelled': return '❌';
    default: return '❓';
  }
};

// Trade Supplies data for service products
export const MOCK_TRADE_SUPPLIES = [
  { id: 'ts1', name: 'Fuel (Gasoline)', costPerUnit: 3.50, unit: 'gallon' },
  { id: 'ts2', name: 'Fuel (Diesel)', costPerUnit: 3.80, unit: 'gallon' },
  { id: 'ts3', name: 'Coal', costPerUnit: 0.15, unit: 'pound' },
  { id: 'ts4', name: 'Coke', costPerUnit: 0.25, unit: 'pound' },
  { id: 'ts5', name: 'Propane', costPerUnit: 2.50, unit: 'gallon' },
  { id: 'ts6', name: 'Welding Rods', costPerUnit: 0.75, unit: 'piece' },
  { id: 'ts7', name: 'Sandpaper', costPerUnit: 0.50, unit: 'sheet' },
  { id: 'ts8', name: 'Paint Brushes', costPerUnit: 2.00, unit: 'piece' },
  { id: 'ts9', name: 'Cleaning Supplies', costPerUnit: 1.25, unit: 'bottle' },
  { id: 'ts10', name: 'Safety Equipment', costPerUnit: 15.00, unit: 'piece' },
  { id: 'ts11', name: 'Lubricants', costPerUnit: 8.50, unit: 'quart' },
  { id: 'ts12', name: 'Adhesives', costPerUnit: 5.75, unit: 'tube' },
  { id: 'ts13', name: 'Fasteners', costPerUnit: 0.10, unit: 'piece' },
  { id: 'ts14', name: 'Electrical Wire', costPerUnit: 0.25, unit: 'foot' },
  { id: 'ts15', name: 'Plumbing Fittings', costPerUnit: 1.50, unit: 'piece' }
];

export const MOCK_TRADE_UNITS = [
  'gallon', 'pound', 'piece', 'sheet', 'bottle', 'quart', 'tube', 'foot', 'box', 'roll', 'case', 'pack'
];
