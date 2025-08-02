import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0),
  isAvailable: z.boolean().default(true)
});

const updateProductSchema = createProductSchema.partial();

// GET /api/vendor/products - Get all products for the authenticated vendor
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // First get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get all products for this vendor
    const products = await prisma.product.findMany({
      where: { vendorProfileId: vendorProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch products'
    });
  }
});

// POST /api/vendor/products - Create a new product
router.post('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Validate request body
    const validationResult = createProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const productData = validationResult.data;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        vendorProfileId: vendorProfile.id,
        tags: productData.tags || []
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create product'
    });
  }
});

// GET /api/vendor/products/:id - Get a specific product by ID
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch product'
    });
  }
});

// PUT /api/vendor/products/:id - Update a product by ID
router.put('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = updateProductSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Update the product and ensure it belongs to this vendor
    const product = await prisma.product.updateMany({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      },
      data: updateData
    });

    if (product.count === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Get the updated product
    const updatedProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update product'
    });
  }
});

// DELETE /api/vendor/products/:id - Delete a product by ID
router.delete('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vendor profile for the authenticated user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.session.userId },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Delete the product and ensure it belongs to this vendor
    const product = await prisma.product.deleteMany({
      where: {
        id,
        vendorProfileId: vendorProfile.id
      }
    });

    if (product.count === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete product'
    });
  }
});

export default router; 