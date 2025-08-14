import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Mock data storage
let ingredients = [
  {
    id: '1',
    name: 'Organic Flour',
    description: 'High-quality organic all-purpose flour',
    unit: 'kilograms',
    costPerUnit: 3.50,
    supplier: 'Local Market',
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: false, // Low stock
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
    isAvailable: true,
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
    isAvailable: false, // Low stock
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Validation schemas
const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  costPerUnit: z.number().min(0, 'Cost must be positive'),
  supplier: z.string().optional()
});

const updateIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  costPerUnit: z.number().min(0, 'Cost must be positive').optional(),
  supplier: z.string().optional()
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

// GET /api/ingredients - Get all ingredients for vendor
router.get('/', (req, res) => {
  try {
    return res.json({
      message: 'Ingredients retrieved successfully',
      ingredients: ingredients
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return res.status(400).json({ message: 'Failed to fetch ingredients' });
  }
});

// GET /api/ingredients/:id - Get specific ingredient
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = ingredients.find(i => i.id === id);
    
    if (!ingredient) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }
    
    return res.json({
      message: 'Ingredient retrieved successfully',
      ingredient
    });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return res.status(400).json({ message: 'Failed to fetch ingredient' });
  }
});

// POST /api/ingredients - Create new ingredient
router.post('/', validateRequest(createIngredientSchema), (req, res) => {
  try {
    const newIngredient = {
      id: Date.now().toString(),
      ...req.body,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ingredients.push(newIngredient);
    
    return res.status(400).json({
      message: 'Ingredient created successfully',
      ingredient: newIngredient
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return res.status(400).json({ message: 'Failed to create ingredient' });
  }
});

// PUT /api/ingredients/:id - Update ingredient
router.put('/:id', validateRequest(updateIngredientSchema), (req, res) => {
  try {
    const { id } = req.params;
    const ingredientIndex = ingredients.findIndex(i => i.id === id);
    
    if (ingredientIndex === -1) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }
    
    const updatedIngredient = {
      ...ingredients[ingredientIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    ingredients[ingredientIndex] = updatedIngredient;
    
    return res.json({
      message: 'Ingredient updated successfully',
      ingredient: updatedIngredient
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return res.status(400).json({ message: 'Failed to update ingredient' });
  }
});

// DELETE /api/ingredients/:id - Delete ingredient
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ingredientIndex = ingredients.findIndex(i => i.id === id);
    
    if (ingredientIndex === -1) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }
    
    const deletedIngredient = ingredients[ingredientIndex];
    ingredients.splice(ingredientIndex, 1);
    
    return res.json({
      message: 'Ingredient deleted successfully',
      ingredient: deletedIngredient
    });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return res.status(400).json({ message: 'Failed to delete ingredient' });
  }
});

export default router; 