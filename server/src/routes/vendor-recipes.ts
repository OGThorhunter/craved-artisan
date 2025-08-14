import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
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
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// GET /api/vendor/recipes - Get all recipes for the vendor
router.get('/', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
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
            recipeIngredients: true,
            recipeVersions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({
      recipes,
      count: recipes.length
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return res.status(400).json({ message: 'Failed to fetch recipes' });
  }
});

// GET /api/vendor/recipes/:id - Get a specific recipe
router.get('/:id', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
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
        },
        recipeIngredients: {
          include: {
            ingredient: true
          }
        },
        _count: {
          select: {
            recipeVersions: true
          }
        }
      }
    });

    if (!recipe) {
      return res.status(400).json({ message: 'Recipe not found' });
    }

    return res.json({ recipe });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return res.status(400).json({ message: 'Failed to fetch recipe' });
  }
});

// POST /api/vendor/recipes - Create a new recipe
router.post('/', requireAuth, requireRole([Role.VENDOR]), validateRequest(createRecipeSchema), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
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

    return res.status(400).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(400).json({ message: 'Failed to create recipe' });
  }
});

// PUT /api/vendor/recipes/:id - Update a recipe
router.put('/:id', requireAuth, requireRole([Role.VENDOR]), validateRequest(updateRecipeSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!existingRecipe) {
      return res.status(400).json({ message: 'Recipe not found' });
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

    return res.json({
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(400).json({ message: 'Failed to update recipe' });
  }
});

// DELETE /api/vendor/recipes/:id - Delete a recipe
router.delete('/:id', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const { id } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!recipe) {
      return res.status(400).json({ message: 'Recipe not found' });
    }

    await prisma.recipe.delete({
      where: { id }
    });

    return res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return res.status(400).json({ message: 'Failed to delete recipe' });
  }
});

       // POST /api/vendor/recipes/:id/version - Create a snapshot version of a recipe
       router.post('/:id/version', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
         try {
           const { id } = req.params;
           const { notes } = req.body; // Optional version notes

           const vendorProfile = await prisma.vendorProfile.findUnique({
             where: { userId: req.session.userId! }
           });

           if (!vendorProfile) {
             return res.status(400).json({ message: 'Vendor profile not found' });
           }

           // Get the recipe with all its ingredients and their current costs
           const recipe = await prisma.recipe.findFirst({
             where: {
               id,
               vendorProfileId: vendorProfile.id
             },
             include: {
               recipeIngredients: {
                 include: {
                   ingredient: true
                 }
               }
             }
           });

           if (!recipe) {
             return res.status(400).json({ message: 'Recipe not found' });
           }

           if (recipe.recipeIngredients.length === 0) {
             return res.status(400).json({ message: 'Cannot create version for recipe with no ingredients' });
           }

           // Get the next version number
           const latestVersion = await prisma.recipeVersion.findFirst({
             where: { recipeId: id },
             orderBy: { version: 'desc' }
           });
           const nextVersion = (latestVersion?.version || 0) + 1;

           // Calculate total cost and prepare ingredient versions
           let totalCost = 0;
           const ingredientVersions = [];

           for (const recipeIngredient of recipe.recipeIngredients) {
             const ingredientCost = Number(recipeIngredient.quantity) * Number(recipeIngredient.ingredient.costPerUnit);
             totalCost += ingredientCost;

             ingredientVersions.push({
               quantity: recipeIngredient.quantity,
               unit: recipeIngredient.unit,
               pricePerUnit: recipeIngredient.ingredient.costPerUnit,
               totalCost: ingredientCost,
               notes: recipeIngredient.notes,
               ingredientId: recipeIngredient.ingredientId
             });
           }

           // Create the recipe version with all ingredient versions
           const recipeVersion = await prisma.recipeVersion.create({
             data: {
               version: nextVersion,
               name: recipe.name,
               description: recipe.description,
               instructions: recipe.instructions,
               yield: recipe.yield,
               yieldUnit: recipe.yieldUnit,
               prepTime: recipe.prepTime,
               cookTime: recipe.cookTime,
               difficulty: recipe.difficulty,
               totalCost,
               notes,
               recipeId: id,
                               editorId: req.session.userId!, // Track who created this version
               recipeIngredientVersions: {
                 create: ingredientVersions
               }
             },
             include: {
               editor: {
                 select: {
                   id: true,
                   name: true,
                   email: true
                 }
               },
               recipeIngredientVersions: {
                 include: {
                   ingredient: {
                     select: {
                       id: true,
                       name: true,
                       description: true,
                       unit: true,
                       costPerUnit: true
                     }
                   }
                 }
               }
             }
           });

           return res.status(400).json({
             message: `Recipe version ${nextVersion} created successfully`,
             recipeVersion: {
               id: recipeVersion.id,
               version: recipeVersion.version,
               name: recipeVersion.name,
               description: recipeVersion.description,
               instructions: recipeVersion.instructions,
               yield: recipeVersion.yield,
               yieldUnit: recipeVersion.yieldUnit,
               prepTime: recipeVersion.prepTime,
               cookTime: recipeVersion.cookTime,
               difficulty: recipeVersion.difficulty,
               totalCost: recipeVersion.totalCost,
               notes: recipeVersion.notes,
               createdAt: recipeVersion.createdAt,
               updatedAt: recipeVersion.updatedAt,
               editorId: recipeVersion.editorId,
               ingredients: recipeVersion.recipeIngredientVersions.map(ing => ({
                 id: ing.id,
                 quantity: ing.quantity,
                 unit: ing.unit,
                 pricePerUnit: ing.pricePerUnit,
                 totalCost: ing.totalCost,
                 notes: ing.notes,
                 ingredient: ing.ingredient
               }))
             }
           });
         } catch (error) {
           console.error('Error creating recipe version:', error);
           return res.status(400).json({ message: 'Failed to create recipe version' });
         }
       });

       // GET /api/vendor/recipes/:id/versions - Get all versions of a recipe
       router.get('/:id/versions', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
         try {
           const { id } = req.params;

           const vendorProfile = await prisma.vendorProfile.findUnique({
             where: { userId: req.session.userId! }
           });

           if (!vendorProfile) {
             return res.status(400).json({ message: 'Vendor profile not found' });
           }

           // Check if recipe exists and belongs to vendor
           const recipe = await prisma.recipe.findFirst({
             where: {
               id,
               vendorProfileId: vendorProfile.id
             }
           });

           if (!recipe) {
             return res.status(400).json({ message: 'Recipe not found' });
           }

           const versions = await prisma.recipeVersion.findMany({
             where: { recipeId: id },
             include: {
               editor: {
                 select: {
                   id: true,
                   name: true,
                   email: true
                 }
               },
               recipeIngredientVersions: {
                 include: {
                   ingredient: {
                     select: {
                       id: true,
                       name: true,
                       description: true,
                       unit: true,
                       costPerUnit: true
                     }
                   }
                 }
               }
             },
             orderBy: { version: 'desc' }
           });

           // Calculate cost deltas between versions
           const versionsWithDeltas = versions.map((version, index) => {
             const previousVersion = versions[index + 1]; // Next version in array (lower version number)
             const costDelta = previousVersion 
               ? Number(version.totalCost) - Number(previousVersion.totalCost)
               : 0;
             const costDeltaPercent = previousVersion && Number(previousVersion.totalCost) > 0
               ? (costDelta / Number(previousVersion.totalCost)) * 100
               : 0;

             return {
               id: version.id,
               version: version.version,
               name: version.name,
               description: version.description,
               instructions: version.instructions,
               yield: version.yield,
               yieldUnit: version.yieldUnit,
               prepTime: version.prepTime,
               cookTime: version.cookTime,
               difficulty: version.difficulty,
               totalCost: version.totalCost,
               notes: version.notes,
               createdAt: version.createdAt,
               updatedAt: version.updatedAt,
               editor: version.editor,
               costDelta,
               costDeltaPercent,
               ingredients: version.recipeIngredientVersions.map(ing => ({
                 id: ing.id,
                 quantity: ing.quantity,
                 unit: ing.unit,
                 pricePerUnit: ing.pricePerUnit,
                 totalCost: ing.totalCost,
                 notes: ing.notes,
                 ingredient: ing.ingredient
               }))
             };
           });

           return res.json({
             message: `Found ${versions.length} versions for recipe`,
             versions: versionsWithDeltas
           });
         } catch (error) {
           console.error('Error fetching recipe versions:', error);
           return res.status(400).json({ message: 'Failed to fetch recipe versions' });
         }
       });

// GET /api/vendor/recipes/:id/versions/:version - Get a specific version
router.get('/:id/versions/:version', requireAuth, requireRole([Role.VENDOR]), async (req, res) => {
  try {
    const { id, version } = req.params;

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId! }
    });

    if (!vendorProfile) {
      return res.status(400).json({ message: 'Vendor profile not found' });
    }

    // Check if recipe exists and belongs to vendor
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!recipe) {
      return res.status(400).json({ message: 'Recipe not found' });
    }

    const recipeVersion = await prisma.recipeVersion.findFirst({
      where: { 
        recipeId: id,
        version: parseInt(version)
      },
      include: {
        recipeIngredientVersions: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true,
                description: true,
                unit: true,
                costPerUnit: true
              }
            }
          }
        }
      }
    });

    if (!recipeVersion) {
      return res.status(400).json({ message: 'Recipe version not found' });
    }

    // Get previous version for cost delta calculation
    const previousVersion = await prisma.recipeVersion.findFirst({
      where: { 
        recipeId: id,
        version: parseInt(version) - 1
      }
    });

    const costDelta = previousVersion 
      ? Number(recipeVersion.totalCost) - Number(previousVersion.totalCost)
      : 0;
    const costDeltaPercent = previousVersion && Number(previousVersion.totalCost) > 0
      ? (costDelta / Number(previousVersion.totalCost)) * 100
      : 0;

    return res.json({
      recipeVersion: {
        id: recipeVersion.id,
        version: recipeVersion.version,
        name: recipeVersion.name,
        description: recipeVersion.description,
        instructions: recipeVersion.instructions,
        yield: recipeVersion.yield,
        yieldUnit: recipeVersion.yieldUnit,
        prepTime: recipeVersion.prepTime,
        cookTime: recipeVersion.cookTime,
        difficulty: recipeVersion.difficulty,
        totalCost: recipeVersion.totalCost,
        notes: recipeVersion.notes,
        createdAt: recipeVersion.createdAt,
        updatedAt: recipeVersion.updatedAt,
                 editorId: req.session.userId!,
        costDelta,
        costDeltaPercent,
        ingredients: recipeVersion.recipeIngredientVersions.map(ing => ({
          id: ing.id,
          quantity: ing.quantity,
          unit: ing.unit,
          pricePerUnit: ing.pricePerUnit,
          totalCost: ing.totalCost,
          notes: ing.notes,
          ingredient: ing.ingredient
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching recipe version:', error);
    return res.status(400).json({ message: 'Failed to fetch recipe version' });
  }
});

export default router; 
