import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  yield: z.number().int().positive('Yield must be a positive integer'),
  yieldUnit: z.string().min(1, 'Yield unit is required').max(20, 'Yield unit must be less than 20 characters'),
  prepTime: z.number().int().min(0, 'Prep time must be non-negative').optional(),
  cookTime: z.number().int().min(0, 'Cook time must be non-negative').optional(),
  difficulty: z.string().optional(),
  isActive: z.boolean().default(true),
  productId: z.string().optional() // Optional link to a product
});

const updateRecipeSchema = createRecipeSchema.partial();

const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'Ingredient ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional()
});

const batchAddIngredientsSchema = z.object({
  ingredients: z.array(recipeIngredientSchema).min(1, 'At least one ingredient is required')
});

// Custom validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
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

// GET /api/recipes - Get all recipes for the vendor
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const recipes = await prisma.recipe.findMany({
      where: { vendorProfileId: vendorProfile.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        _count: {
          select: {
            recipeIngredients: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      recipes,
      count: recipes.length
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// GET /api/recipes/:id - Get a specific recipe
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

// GET /api/recipes/:id/ingredients - Get all ingredients for a recipe
router.get('/:id/ingredients', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: id },
      include: {
        ingredient: true
      },
      orderBy: { ingredient: { name: 'asc' } }
    });

    res.json({
      recipeIngredients,
      count: recipeIngredients.length
    });
  } catch (error) {
    console.error('Error fetching recipe ingredients:', error);
    res.status(500).json({ message: 'Failed to fetch recipe ingredients' });
  }
});

// POST /api/recipes - Create a new recipe
router.post('/', requireAuth, requireRole(['VENDOR']), validateRequest(createRecipeSchema), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // If productId is provided, verify it belongs to the vendor
    if (req.body.productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: req.body.productId,
          vendorProfileId: vendorProfile.id
        }
      });

      if (!product) {
        return res.status(400).json({ message: 'Product not found or does not belong to vendor' });
      }
    }

    const recipe = await prisma.recipe.create({
      data: {
        ...req.body,
        vendorProfileId: vendorProfile.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

// PUT /api/recipes/:id - Update a recipe
router.put('/:id', requireAuth, requireRole(['VENDOR']), validateRequest(updateRecipeSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // If productId is provided, verify it belongs to the vendor
    if (req.body.productId) {
      const product = await prisma.product.findFirst({
        where: {
          id: req.body.productId,
          vendorProfileId: vendorProfile.id
        }
      });

      if (!product) {
        return res.status(400).json({ message: 'Product not found or does not belong to vendor' });
      }
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: req.body,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.json({
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

// DELETE /api/recipes/:id - Delete a recipe
router.delete('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Delete recipe (recipe ingredients will be deleted due to CASCADE)
    await prisma.recipe.delete({
      where: { id }
    });

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
});

// POST /api/recipes/:id/ingredients - Batch add ingredients to a recipe
router.post('/:id/ingredients', requireAuth, requireRole(['VENDOR']), validateRequest(batchAddIngredientsSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredients } = req.body;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Verify all ingredients belong to the vendor
    const ingredientIds = ingredients.map((ing: any) => ing.ingredientId);
    const vendorIngredients = await prisma.ingredient.findMany({
      where: {
        id: { in: ingredientIds },
        vendorProfileId: vendorProfile.id
      },
      select: { id: true }
    });

    if (vendorIngredients.length !== ingredientIds.length) {
      return res.status(400).json({ 
        message: 'One or more ingredients not found or do not belong to vendor' 
      });
    }

    // Create recipe ingredients in a transaction
    const recipeIngredients = await prisma.$transaction(async (tx) => {
      const createdIngredients = [];

      for (const ingredientData of ingredients) {
        // Check if ingredient already exists in recipe
        const existing = await tx.recipeIngredient.findUnique({
          where: {
            recipeId_ingredientId: {
              recipeId: id,
              ingredientId: ingredientData.ingredientId
            }
          }
        });

        if (existing) {
          // Update existing ingredient
          const updated = await tx.recipeIngredient.update({
            where: {
              recipeId_ingredientId: {
                recipeId: id,
                ingredientId: ingredientData.ingredientId
              }
            },
            data: {
              quantity: ingredientData.quantity,
              unit: ingredientData.unit,
              notes: ingredientData.notes
            },
            include: {
              ingredient: true
            }
          });
          createdIngredients.push(updated);
        } else {
          // Create new ingredient
          const created = await tx.recipeIngredient.create({
            data: {
              ...ingredientData,
              recipeId: id
            },
            include: {
              ingredient: true
            }
          });
          createdIngredients.push(created);
        }
      }

      return createdIngredients;
    });

    res.status(201).json({
      message: 'Ingredients added to recipe successfully',
      recipeIngredients,
      count: recipeIngredients.length
    });
  } catch (error) {
    console.error('Error adding ingredients to recipe:', error);
    res.status(500).json({ message: 'Failed to add ingredients to recipe' });
  }
});

// DELETE /api/recipes/:id/ingredients/:ingredientId - Remove an ingredient from a recipe
router.delete('/:id/ingredients/:ingredientId', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id, ingredientId } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Delete the recipe ingredient
    await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId
        }
      }
    });

    res.json({ message: 'Ingredient removed from recipe successfully' });
  } catch (error) {
    console.error('Error removing ingredient from recipe:', error);
    res.status(500).json({ message: 'Failed to remove ingredient from recipe' });
  }
});

export default router; 