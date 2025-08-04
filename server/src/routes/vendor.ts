import express from 'express';
import { z } from 'zod';

const router = express.Router();

// TypeScript interfaces
interface VendorProduct {
  id: string;
  name: string;
  price: number;
  tags: string[];
  image: string;
  description?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface VendorReview {
  rating: number;
  text: string;
  userName?: string;
  date?: string;
  helpful?: number;
}

interface PickupDetails {
  nextPickup: string;
  location: string;
  deliveryZipCodes: string[];
  businessHours?: string;
  deliveryAreas?: string[];
}

interface Vendor {
  id: string;
  name: string;
  location: string;
  avatar: string;
  isVerified: boolean;
  isOnVacation: boolean;
  tagline: string;
  story: string;
  values: string[];
  pickupDetails: PickupDetails;
  products: VendorProduct[];
  reviews: VendorReview[];
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  followers?: number;
  joinedDate?: string;
  description?: string;
  contact?: {
    email: string;
    phone?: string;
    website?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// Zod validation schema
const vendorIdSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required')
});

// Mock data
const mockVendors: Record<string, Vendor> = {
  'vendor_001': {
    id: 'vendor_001',
    name: 'Rose Creek Bakery',
    location: 'Locust Grove, GA',
    avatar: '/assets/vendors/rosecreek.png',
    isVerified: true,
    isOnVacation: false,
    tagline: 'Fresh-milled, naturally fermented sourdough.',
    story: 'At Rose Creek Bakery, we mill our flour fresh from organic grains and use a 100-year-old sourdough starter passed down through generations. Our stone-ground flour and natural fermentation process create bread with exceptional flavor and digestibility.',
    values: ['Sustainable Packaging', 'Family Owned', 'Cottage Food Certified'],
    pickupDetails: {
      nextPickup: 'Friday 3–5PM',
      location: 'Locust Grove Farmers Market',
      deliveryZipCodes: ['30248', '30252'],
      businessHours: 'Wed-Sat 8AM-6PM',
      deliveryAreas: ['Locust Grove', 'McDonough', 'Jackson']
    },
    products: [
      {
        id: 'product_001',
        name: 'Cinnamon Rolls',
        price: 12,
        tags: ['#bestseller'],
        image: '/assets/products/cinnamonrolls.png',
        description: 'Hand-rolled cinnamon rolls with cream cheese frosting',
        inStock: true,
        rating: 4.9,
        reviewCount: 45
      },
      {
        id: 'product_002',
        name: 'Artisan Sourdough',
        price: 9,
        tags: ['#organic', '#sourdough'],
        image: '/assets/products/sourdough.png',
        description: 'Traditional sourdough bread with perfect crust',
        inStock: true,
        rating: 4.8,
        reviewCount: 89
      },
      {
        id: 'product_003',
        name: 'Whole Wheat Bread',
        price: 8,
        tags: ['#healthy', '#whole-grain'],
        image: '/assets/products/wholewheat.png',
        description: 'Nutritious whole wheat bread with seeds',
        inStock: true,
        rating: 4.7,
        reviewCount: 32
      },
      {
        id: 'product_004',
        name: 'Chocolate Croissants',
        price: 6,
        tags: ['#pastry', '#chocolate'],
        image: '/assets/products/croissants.png',
        description: 'Buttery croissants with dark chocolate',
        inStock: false,
        rating: 4.9,
        reviewCount: 67
      }
    ],
    reviews: [
      { 
        rating: 5, 
        text: 'Best sourdough I\'ve ever had. The texture is perfect and the flavor is incredible.',
        userName: 'Sarah M.',
        date: '2024-01-18',
        helpful: 12
      },
      { 
        rating: 5, 
        text: 'Amazing quality and taste. The cinnamon rolls are to die for!',
        userName: 'Michael R.',
        date: '2024-01-16',
        helpful: 8
      },
      { 
        rating: 4, 
        text: 'Great quality, friendly service. Love the whole wheat bread.',
        userName: 'Jennifer L.',
        date: '2024-01-14',
        helpful: 5
      },
      { 
        rating: 5, 
        text: 'Fresh, delicious bread every time. Highly recommend!',
        userName: 'David K.',
        date: '2024-01-12',
        helpful: 3
      }
    ],
    rating: 4.9,
    reviewCount: 127,
    totalProducts: 24,
    followers: 156,
    joinedDate: '2018-03-15',
    description: 'Artisanal bakery specializing in naturally leavened breads and pastries.',
    contact: {
      email: 'hello@rosecreekbakery.com',
      phone: '(770) 555-0123',
      website: 'https://rosecreekbakery.com'
    },
    social: {
      instagram: '@rosecreekbakery',
      facebook: 'rosecreekbakery',
      twitter: '@rosecreekbakery'
    }
  },
  'vendor_002': {
    id: 'vendor_002',
    name: 'Green Valley Farm',
    location: 'Griffin, GA',
    avatar: '/assets/vendors/greenvalley.png',
    isVerified: true,
    isOnVacation: false,
    tagline: 'Fresh from our fields to your table.',
    story: 'Green Valley Farm has been growing organic vegetables and herbs for over 20 years. We believe in sustainable farming practices and providing the freshest produce to our community.',
    values: ['Organic Certified', 'Sustainable Farming', 'Local Delivery'],
    pickupDetails: {
      nextPickup: 'Saturday 9AM-1PM',
      location: 'Griffin Farmers Market',
      deliveryZipCodes: ['30223', '30224'],
      businessHours: 'Tue-Sat 7AM-5PM',
      deliveryAreas: ['Griffin', 'Zebulon', 'Williamson']
    },
    products: [
      {
        id: 'product_101',
        name: 'Organic Tomatoes',
        price: 4,
        tags: ['#organic', '#fresh'],
        image: '/assets/products/tomatoes.png',
        description: 'Vine-ripened organic tomatoes',
        inStock: true,
        rating: 4.8,
        reviewCount: 23
      },
      {
        id: 'product_102',
        name: 'Fresh Basil',
        price: 3,
        tags: ['#herbs', '#organic'],
        image: '/assets/products/basil.png',
        description: 'Fresh organic basil',
        inStock: true,
        rating: 4.9,
        reviewCount: 18
      }
    ],
    reviews: [
      { 
        rating: 5, 
        text: 'The freshest vegetables I\'ve ever tasted. Highly recommend!',
        userName: 'Lisa P.',
        date: '2024-01-17',
        helpful: 7
      },
      { 
        rating: 4, 
        text: 'Great quality produce and friendly service.',
        userName: 'Robert T.',
        date: '2024-01-15',
        helpful: 4
      }
    ],
    rating: 4.8,
    reviewCount: 89,
    totalProducts: 15,
    followers: 94,
    joinedDate: '2019-06-10',
    description: 'Organic vegetable and herb farm serving the Griffin area.',
    contact: {
      email: 'info@greenvalleyfarm.com',
      phone: '(770) 555-0456'
    },
    social: {
      instagram: '@greenvalleyfarm',
      facebook: 'greenvalleyfarm'
    }
  }
};

// GET /api/vendor/:vendorId
router.get('/:vendorId', async (req, res) => {
  try {
    // Validate vendor ID
    const { vendorId } = vendorIdSchema.parse(req.params);
    
    // Check if vendor exists
    const vendor = mockVendors[vendorId];
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: `No vendor found with ID: ${vendorId}`
      });
    }

    // Return vendor data
    res.json({
      success: true,
      data: vendor
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch vendor data'
    });
  }
});

// GET /api/vendor/:vendorId/products
router.get('/:vendorId/products', async (req, res) => {
  try {
    const { vendorId } = vendorIdSchema.parse(req.params);
    
    const vendor = mockVendors[vendorId];
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Query parameters for filtering
    const { 
      category, 
      inStock, 
      minPrice, 
      maxPrice, 
      sortBy = 'name', 
      sortOrder = 'asc',
      limit = 20,
      offset = 0
    } = req.query;

    let products = [...vendor.products];

    // Apply filters
    if (category) {
      products = products.filter(p => p.tags.some(tag => tag.toLowerCase().includes(category.toString().toLowerCase())));
    }

    if (inStock !== undefined) {
      const stockFilter = inStock === 'true';
      products = products.filter(p => p.inStock === stockFilter);
    }

    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice.toString()));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice.toString()));
    }

    // Apply sorting
    products.sort((a, b) => {
      let aValue: any = a[sortBy as keyof VendorProduct];
      let bValue: any = b[sortBy as keyof VendorProduct];

      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        [aValue, bValue] = [bValue, aValue];
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    // Apply pagination
    const total = products.length;
    const paginatedProducts = products.slice(parseInt(offset.toString()), parseInt(offset.toString()) + parseInt(limit.toString()));

    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore: parseInt(offset.toString()) + parseInt(limit.toString()) < total
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error fetching vendor products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/vendor/:vendorId/reviews
router.get('/:vendorId/reviews', async (req, res) => {
  try {
    const { vendorId } = vendorIdSchema.parse(req.params);
    
    const vendor = mockVendors[vendorId];
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const { limit = 10, offset = 0 } = req.query;
    
    const reviews = [...vendor.reviews];
    const total = reviews.length;
    const paginatedReviews = reviews.slice(parseInt(offset.toString()), parseInt(offset.toString()) + parseInt(limit.toString()));

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString()),
          hasMore: parseInt(offset.toString()) + parseInt(limit.toString()) < total
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error fetching vendor reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/vendor/:vendorId/follow
router.post('/:vendorId/follow', async (req, res) => {
  try {
    const { vendorId } = vendorIdSchema.parse(req.params);
    
    const vendor = mockVendors[vendorId];
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // TODO: Implement actual follow logic with user authentication
    // For now, just return success
    res.json({
      success: true,
      message: 'Successfully followed vendor',
      data: {
        vendorId,
        isFollowing: true
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error following vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/vendor/:vendorId/follow
router.delete('/:vendorId/follow', async (req, res) => {
  try {
    const { vendorId } = vendorIdSchema.parse(req.params);
    
    const vendor = mockVendors[vendorId];
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // TODO: Implement actual unfollow logic with user authentication
    res.json({
      success: true,
      message: 'Successfully unfollowed vendor',
      data: {
        vendorId,
        isFollowing: false
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('Error unfollowing vendor:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 