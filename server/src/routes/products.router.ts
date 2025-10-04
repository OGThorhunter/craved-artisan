import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireVendorAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const ProductTypeSchema = z.enum(['FOOD', 'NON_FOOD', 'SERVICE']);

const CreateProductSchema = z.object({
  type: ProductTypeSchema,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
  baseCost: z.number().min(0).default(0),
  laborCost: z.number().min(0).default(0),
  targetMarginLowPct: z.number().min(0).max(100).default(30),
  targetMarginHighPct: z.number().min(0).max(100).default(45),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  taxCode: z.string().optional(),
  // Food-specific
  allergenFlags: z.string().optional(),
  nutritionNotes: z.string().optional(),
  // Service-specific
  serviceDurationMin: z.number().positive().optional(),
  serviceCapacityPerDay: z.number().positive().optional(),
  serviceLeadTimeDays: z.number().positive().optional(),
  requiresDeposit: z.boolean().default(false),
  // Variants
  variants: z.array(z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    priceDelta: z.number().default(0),
    isDefault: z.boolean().default(false),
  })).default([]),
  // Materials
  materials: z.array(z.object({
    inventoryItemId: z.string(),
    qty: z.number().positive(),
    unit: z.string().min(1),
    wastePct: z.number().min(0).max(100).default(0),
  })).default([]),
});

const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string(),
});

const BulkActionSchema = z.object({
  productIds: z.array(z.string()),
  action: z.enum(['enable', 'disable', 'setCategory', 'setPrice', 'export']),
  categoryId: z.string().optional(),
  price: z.number().positive().optional(),
});

const ProductQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  type: ProductTypeSchema.optional(),
  view: z.enum(['grid', 'list']).default('grid'),
  sort: z.enum(['name', 'price', 'updatedAt', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(24),
});

// Helper function to generate slug
function generateSlug(name: string, vendorId: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${vendorId.slice(-6)}`;
}

// Helper function to calculate cost rollup
async function calculateCostRollup(productId: string, vendorId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, vendorProfileId: vendorId },
    include: {
      materials: {
        include: {
          inventoryItem: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const materialsCost = product.materials.reduce((total, material) => {
    const cost = (material.inventoryItem.avgCost || 0) * material.qty * (1 + material.wastePct / 100);
    return total + cost;
  }, 0);

  const totalCost = product.baseCost + product.laborCost + materialsCost;
  const marginAtPrice = product.price - totalCost;
  const marginPct = product.price > 0 ? (marginAtPrice / product.price) * 100 : 0;

  return {
    materialsCost,
    laborCost: product.laborCost,
    baseCost: product.baseCost,
    totalCost,
    marginAtPrice,
    marginPct,
  };
}

// GET /api/vendor/products - List products with filtering and pagination
router.get('/', requireVendorAuth, validateRequest(ProductQuerySchema, 'query'), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const {
      query,
      category,
      type,
      view,
      sort,
      order,
      page,
      pageSize,
    } = req.query as z.infer<typeof ProductQuerySchema>;

    const where: any = {
      vendorProfileId: vendorId,
      active: true,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (type) {
      where.type = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          variants: true,
          materials: {
            include: {
              inventoryItem: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate cost rollups for each product
    const productsWithCosts = await Promise.all(
      products.map(async (product) => {
        const costRollup = await calculateCostRollup(product.id, vendorId);
        return {
          ...product,
          costRollup,
        };
      })
    );

    res.json({
      products: productsWithCosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/vendor/products/:id - Get single product
router.get('/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id, vendorProfileId: vendorId },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        materials: {
          include: {
            inventoryItem: true,
          },
        },
        competitorPrices: {
          orderBy: { capturedAt: 'desc' },
          take: 5,
        },
        priceHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const costRollup = await calculateCostRollup(id, vendorId);

    res.json({
      ...product,
      costRollup,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/vendor/products - Create new product
router.post('/', requireVendorAuth, validateRequest(CreateProductSchema), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const data = req.body as z.infer<typeof CreateProductSchema>;

    // Generate unique slug
    const slug = generateSlug(data.name, vendorId);

    const product = await prisma.product.create({
        data: {
          ...data,
          slug,
          vendorProfileId: vendorId,
          tags: data.tags ? JSON.stringify(data.tags.split(',').map(t => t.trim())) : null,
          allergenFlags: data.allergenFlags ? JSON.stringify(data.allergenFlags.split(',').map(a => a.trim())) : null,
          variants: {
            create: data.variants,
          },
          materials: {
            create: data.materials,
          },
        },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        materials: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    const costRollup = await calculateCostRollup(product.id, vendorId);

    res.status(201).json({
      ...product,
      costRollup,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'Product with this name or SKU already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
});

// PUT /api/vendor/products/:id - Update product
router.put('/:id', requireVendorAuth, validateRequest(UpdateProductSchema), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { id } = req.params;
    const data = req.body as z.infer<typeof UpdateProductSchema>;

    // Check if product exists and belongs to vendor
    const existingProduct = await prisma.product.findFirst({
      where: { id, vendorProfileId: vendorId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Generate new slug if name changed
    const updateData: any = { ...data };
    if (data.name && data.name !== existingProduct.name) {
      updateData.slug = generateSlug(data.name, vendorId);
    }
    
    // Handle JSON string fields
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags.split(',').map(t => t.trim()));
    }
    if (data.allergenFlags) {
      updateData.allergenFlags = JSON.stringify(data.allergenFlags.split(',').map(a => a.trim()));
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        variants: data.variants ? {
          deleteMany: {},
          create: data.variants,
        } : undefined,
        materials: data.materials ? {
          deleteMany: {},
          create: data.materials,
        } : undefined,
      },
      include: {
        category: true,
        subcategory: true,
        variants: true,
        materials: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    const costRollup = await calculateCostRollup(id, vendorId);

    res.json({
      ...product,
      costRollup,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/vendor/products/:id - Delete product
router.delete('/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id, vendorProfileId: vendorId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/vendor/products/:id/cost-rollup - Get cost breakdown
router.get('/:id/cost-rollup', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { id } = req.params;

    const costRollup = await calculateCostRollup(id, vendorId);
    res.json(costRollup);
  } catch (error) {
    console.error('Error calculating cost rollup:', error);
    res.status(500).json({ error: 'Failed to calculate cost rollup' });
  }
});

// PATCH /api/vendor/products/bulk - Bulk actions
router.patch('/bulk', requireVendorAuth, validateRequest(BulkActionSchema), async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { productIds, action, categoryId, price } = req.body as z.infer<typeof BulkActionSchema>;

    const where = {
      id: { in: productIds },
      vendorProfileId: vendorId,
    };

    let updateData: any = {};
    let result;

    switch (action) {
      case 'enable':
        updateData = { active: true };
        result = await prisma.product.updateMany({ where, data: updateData });
        break;
      case 'disable':
        updateData = { active: false };
        result = await prisma.product.updateMany({ where, data: updateData });
        break;
      case 'setCategory':
        if (!categoryId) {
          return res.status(400).json({ error: 'Category ID required for setCategory action' });
        }
        updateData = { categoryId };
        result = await prisma.product.updateMany({ where, data: updateData });
        break;
      case 'setPrice':
        if (!price) {
          return res.status(400).json({ error: 'Price required for setPrice action' });
        }
        updateData = { price };
        result = await prisma.product.updateMany({ where, data: updateData });
        break;
      case 'export':
        const products = await prisma.product.findMany({
          where,
          include: {
            category: true,
            subcategory: true,
            variants: true,
            materials: {
              include: {
                inventoryItem: true,
              },
            },
          },
        });
        return res.json({ products });
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ updated: result.count });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// GET /api/vendor/categories - Get categories and subcategories
router.get('/categories', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;

    const categories = await prisma.category.findMany({
      where: { vendorProfileId: vendorId },
      include: {
        children: true,
        subcategories: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/vendor/categories - Create category
router.post('/categories', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.user!.vendorProfileId;
    const { name, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        parentId,
        vendorProfileId: vendorId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
