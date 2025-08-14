import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../lib/prisma';

const router = express.Router();

// Validation schemas
const createIngredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  costPerUnit: z.number().min(0, 'Cost must be non-negative'),
  supplier: z.string().optional(),
  isAvailable: z.boolean().default(true)
});

const updateIngredientSchema = createIngredientSchema.partial();

// Custom validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// GET /api/ingredients - Get all ingredients for the vendor
router.get('/', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { vendorProfileId: vendorProfile.id },
      orderBy: { name: 'asc' }
    });

    return res.json({
      ingredients,
      count: ingredients.length
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return res.status(400).json({ message: 'Failed to fetch ingredients' });
  }
});

// GET /api/ingredients/:id - Get a specific ingredient
router.get('/:id', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!ingredient) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }

    return res.json({ ingredient });
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return res.status(400).json({ message: 'Failed to fetch ingredient' });
  }
});

// POST /api/ingredients - Create a new ingredient
router.post('/', requireAuth, requireRole([Role.VENDOR]), validateRequest(createIngredientSchema), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        ...req.body,
        vendorProfileId: vendorProfile.id
      }
    });

    return res.status(400).json({
      message: 'Ingredient created successfully',
      ingredient
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return res.status(400).json({ message: 'Failed to create ingredient' });
  }
});

// PUT /api/ingredients/:id - Update an ingredient
router.put('/:id', requireAuth, requireRole([Role.VENDOR]), validateRequest(updateIngredientSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    // Check if ingredient exists and belongs to vendor
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!existingIngredient) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: req.body
    });

    return res.json({
      message: 'Ingredient updated successfully',
      ingredient
    });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return res.status(400).json({ message: 'Failed to update ingredient' });
  }
});

// DELETE /api/ingredients/:id - Delete an ingredient
router.delete('/:id', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    // Check if ingredient exists and belongs to vendor
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      include: {
        recipeIngredients: true
      }
    });

    if (!existingIngredient) {
      return res.status(400).json({ message: 'Ingredient not found' });
    }

    // Check if ingredient is used in any recipes
    if (existingIngredient.recipeIngredients.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete ingredient that is used in recipes. Remove it from all recipes first.'
      });
    }

    await prisma.ingredient.delete({
      where: { id }
    });

    return res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return res.status(400).json({ message: 'Failed to delete ingredient' });
  }
});

export default router; 
