import { Router } from 'express';

export const vendorRouter = Router();

// Mock vendor products data
const mockVendorProducts = [
  {
    id: '1',
    name: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread made with organic flour',
    price: 8.99,
    imageUrl: '/images/sourdough.jpg',
    tags: ['bread', 'sourdough', 'organic'],
    stock: 25,
    isAvailable: true,
    targetMargin: 0.4,
    recipeId: 'recipe-1',
    productType: 'food' as const,
    onWatchlist: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    vendorProfileId: 'vendor-1'
  },
  {
    id: '2',
    name: 'Chocolate Croissant',
    description: 'Buttery croissant filled with premium chocolate',
    price: 4.50,
    imageUrl: '/images/croissant.jpg',
    tags: ['pastry', 'chocolate', 'croissant'],
    stock: 15,
    isAvailable: true,
    targetMargin: 0.35,
    recipeId: 'recipe-2',
    productType: 'food' as const,
    onWatchlist: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    vendorProfileId: 'vendor-1'
  },
  {
    id: '3',
    name: 'Cinnamon Roll',
    description: 'Soft cinnamon roll with cream cheese frosting',
    price: 5.25,
    imageUrl: '/images/cinnamon-roll.jpg',
    tags: ['pastry', 'cinnamon', 'sweet'],
    stock: 20,
    isAvailable: true,
    targetMargin: 0.45,
    recipeId: 'recipe-3',
    productType: 'food' as const,
    onWatchlist: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    vendorProfileId: 'vendor-1'
  }
];

// GET /api/vendor/products
vendorRouter.get('/vendor/products', async (req, res) => {
  try {
    // TODO: Add authentication check
    // if (!req.user || req.user.role !== 'VENDOR') {
    //   return res.status(403).json({ error: 'VENDOR_ACCESS_REQUIRED' });
    // }

    // TODO: Filter products by vendor ID from session
    // const vendorId = req.user.vendorId;
    // const products = await getVendorProducts(vendorId);

    res.json(mockVendorProducts);
  } catch (error: any) {
    console.error('VENDOR_PRODUCTS_ERROR', error);
    res.status(500).json({ error: 'PRODUCTS_FETCH_FAILED', message: error.message });
  }
});
