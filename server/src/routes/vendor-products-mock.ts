import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth-mock';
import { z } from 'zod';

const router = express.Router();

// Mock product data
let mockProducts = [
  {
    id: 'mock-product-1',
    vendorProfileId: 'mock-vendor-id',
    name: 'Handcrafted Wooden Bowl',
    description: 'Beautiful hand-carved wooden bowl made from sustainable oak',
    price: 45.99,
    imageUrl: 'https://placekitten.com/400/300',
    tags: ['handmade', 'wooden', 'artisan'],
    stock: 5,
    isAvailable: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 'mock-product-2',
    vendorProfileId: 'mock-vendor-id',
    name: 'Ceramic Coffee Mug',
    description: 'Hand-thrown ceramic coffee mug with unique glaze',
    price: 22.50,
    imageUrl: 'https://placekitten.com/400/301',
    tags: ['ceramic', 'coffee', 'handmade'],
    stock: 12,
    isAvailable: true,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  }
];

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
    // Simulate vendor profile lookup
    if (req.session.userId === 'mock-user-id') {
      const vendorProducts = mockProducts.filter(product => product.vendorProfileId === 'mock-vendor-id');
      
      res.json({
        products: vendorProducts,
        count: vendorProducts.length
      });
    } else {
      res.json({
        products: [],
        count: 0
      });
    }
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

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Create the product
    const newProduct = {
      id: `mock-product-${Date.now()}`,
      vendorProfileId: 'mock-vendor-id',
      ...productData,
      tags: productData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockProducts.push(newProduct);

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
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

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Get the product and ensure it belongs to this vendor
    const product = mockProducts.find(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

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

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Find and update the product
    const productIndex = mockProducts.findIndex(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Update the product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      message: 'Product updated successfully',
      product: mockProducts[productIndex]
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

    // Simulate vendor profile lookup
    if (req.session.userId !== 'mock-user-id') {
      return res.status(404).json({
        error: 'Vendor profile not found',
        message: 'Please create your vendor profile first'
      });
    }

    // Find and delete the product
    const productIndex = mockProducts.findIndex(p => p.id === id && p.vendorProfileId === 'mock-vendor-id');

    if (productIndex === -1) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product does not exist or does not belong to you'
      });
    }

    // Remove the product
    mockProducts.splice(productIndex, 1);

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