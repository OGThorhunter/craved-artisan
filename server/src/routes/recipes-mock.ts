import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Mock data storage
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
    productId: 'product-1',
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
    productId: null,
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

// Validation schemas
const createRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  yield: z.number().min(1, 'Yield must be at least 1'),
  yieldUnit: z.string().min(1, 'Yield unit is required'),
  prepTime: z.number().min(0).optional(),
  cookTime: z.number().min(0).optional(),
  difficulty: z.string().optional(),
  productId: z.string().optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Ingredient ID is required'),
    quantity: z.number().min(0.01, 'Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    notes: z.string().optional()
  })).min(1, 'At least one ingredient is required')
});

const updateRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  yield: z.number().min(1, 'Yield must be at least 1').optional(),
  yieldUnit: z.string().min(1, 'Yield unit is required').optional(),
  prepTime: z.number().min(0).optional(),
  cookTime: z.number().min(0).optional(),
  difficulty: z.string().optional(),
  productId: z.string().optional(),
  isActive: z.boolean().optional()
});

// Middleware to validate request body
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      next();
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

// GET /api/recipes - Get all recipes for vendor
router.get('/', (req, res) => {
  try {
    // In a real app, this would filter by vendorProfileId from session
    const vendorRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: recipeIngredients.filter(ri => ri.recipeId === recipe.id)
    }));

    return res.json({
      message: 'Recipes retrieved successfully',
      recipes: vendorRecipes
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return res.status(400).json({ message: 'Failed to fetch recipes' });
  }
});

// GET /api/recipes/:id - Get specific recipe with ingredients
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(400).json({ message: 'Recipe not found' });
    }
    
    const ingredients = recipeIngredients.filter(ri => ri.recipeId === id);
    
    return res.json({
      message: 'Recipe retrieved successfully',
      recipe: {
        ...recipe,
        ingredients
      }
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return res.status(400).json({ message: 'Failed to fetch recipe' });
  }
});

// POST /api/recipes - Create new recipe with ingredients
router.post('/', validateRequest(createRecipeSchema), (req, res) => {
  try {
    const { ingredients, ...recipeData } = req.body;
    
    // Create recipe
    const newRecipe = {
      id: Date.now().toString(),
      ...recipeData,
      vendorProfileId: 'vendor-1', // In real app, get from session
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    recipes.push(newRecipe);
    
    // Create recipe ingredients
    const newRecipeIngredients = ingredients.map((ingredient: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      recipeId: newRecipe.id,
      ingredientId: ingredient.ingredientId,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    recipeIngredients.push(...newRecipeIngredients);
    
    return res.status(400).json({
      message: 'Recipe created successfully',
      recipe: {
        ...newRecipe,
        ingredients: newRecipeIngredients
      }
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(400).json({ message: 'Failed to create recipe' });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', validateRequest(updateRecipeSchema), (req, res) => {
  try {
    const { id } = req.params;
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(400).json({ message: 'Recipe not found' });
    }
    
    const updatedRecipe = {
      ...recipes[recipeIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    recipes[recipeIndex] = updatedRecipe;
    
    return res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(400).json({ message: 'Failed to update recipe' });
  }
});

// DELETE /api/recipes/:id - Delete recipe and its ingredients
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipeIndex = recipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(400).json({ message: 'Recipe not found' });
    }
    
    const deletedRecipe = recipes[recipeIndex];
    recipes.splice(recipeIndex, 1);
    
    // Remove associated recipe ingredients
    recipeIngredients = recipeIngredients.filter(ri => ri.recipeId !== id);
    
    return res.json({
      message: 'Recipe deleted successfully',
      recipe: deletedRecipe
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return res.status(400).json({ message: 'Failed to delete recipe' });
  }
});

// GET /api/recipes/:id/ingredients - Get all ingredients for a recipe
router.get('/:id/ingredients', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(400).json({ message: 'Recipe not found' });
    }
    
    const ingredients = recipeIngredients.filter(ri => ri.recipeId === id);
    
    return res.json({
      message: 'Recipe ingredients retrieved successfully',
      ingredients
    });
  } catch (error) {
    console.error('Error fetching recipe ingredients:', error);
    return res.status(400).json({ message: 'Failed to fetch recipe ingredients' });
  }
});

export default router; 