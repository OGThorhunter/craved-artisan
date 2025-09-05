import { Router } from 'express';
import { logger } from '../logger';

export const b2bNetworkRouter = Router();

// Mock B2B network data
interface Supplier {
  id: string;
  name: string;
  type: 'wholesale' | 'manufacturer' | 'distributor' | 'local_farm' | 'specialty';
  category: string[];
  location: {
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  rating: number;
  totalOrders: number;
  avgDeliveryTime: number; // in days
  minOrderValue: number;
  isVerified: boolean;
  specialties: string[];
  certifications: string[];
  createdAt: string;
  lastOrderDate?: string;
}

interface B2BProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  inStock: boolean;
  stockQuantity?: number;
  leadTime: number; // in days
  bulkDiscounts: Array<{
    minQuantity: number;
    discountPercent: number;
  }>;
  specifications: Record<string, string>;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SourcingRequest {
  id: string;
  itemId: string;
  itemName: string;
  requestedQuantity: number;
  maxPrice?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'quoted' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  quotes: Array<{
    supplierId: string;
    supplierName: string;
    price: number;
    leadTime: number;
    totalCost: number;
    isSelected: boolean;
    quotedAt: string;
  }>;
  selectedQuote?: {
    supplierId: string;
    supplierName: string;
    price: number;
    leadTime: number;
    totalCost: number;
    orderId: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface B2BOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'GrainCo Wholesale',
    type: 'wholesale',
    category: ['food_grade', 'raw_materials'],
    location: {
      city: 'Kansas City',
      state: 'MO',
      country: 'USA',
    },
    contact: {
      email: 'orders@grainco.com',
      phone: '(816) 555-0123',
      website: 'https://grainco.com',
    },
    rating: 4.8,
    totalOrders: 156,
    avgDeliveryTime: 3,
    minOrderValue: 500,
    isVerified: true,
    specialties: ['Organic grains', 'Bulk flour', 'Specialty flours'],
    certifications: ['USDA Organic', 'Non-GMO Project', 'Kosher'],
    createdAt: new Date('2023-01-15').toISOString(),
    lastOrderDate: new Date('2024-08-20').toISOString(),
  },
  {
    id: 'supplier-2',
    name: 'Mediterranean Oils Direct',
    type: 'manufacturer',
    category: ['food_grade'],
    location: {
      city: 'Athens',
      state: 'Attica',
      country: 'Greece',
    },
    contact: {
      email: 'export@medoils.gr',
      phone: '+30 210 555-0123',
      website: 'https://medoils.gr',
    },
    rating: 4.9,
    totalOrders: 89,
    avgDeliveryTime: 14,
    minOrderValue: 1000,
    isVerified: true,
    specialties: ['Extra virgin olive oil', 'Cold-pressed oils', 'Organic oils'],
    certifications: ['PDO', 'Organic', 'ISO 22000'],
    createdAt: new Date('2023-03-10').toISOString(),
    lastOrderDate: new Date('2024-07-15').toISOString(),
  },
  {
    id: 'supplier-3',
    name: 'Forest Lumber Co.',
    type: 'manufacturer',
    category: ['raw_materials'],
    location: {
      city: 'Portland',
      state: 'OR',
      country: 'USA',
    },
    contact: {
      email: 'sales@forestlumber.com',
      phone: '(503) 555-0456',
      website: 'https://forestlumber.com',
    },
    rating: 4.6,
    totalOrders: 67,
    avgDeliveryTime: 7,
    minOrderValue: 300,
    isVerified: true,
    specialties: ['Hardwood planks', 'Reclaimed wood', 'Custom cuts'],
    certifications: ['FSC Certified', 'Sustainable Forestry'],
    createdAt: new Date('2023-02-20').toISOString(),
    lastOrderDate: new Date('2024-08-10').toISOString(),
  },
  {
    id: 'supplier-4',
    name: 'PackRight Solutions',
    type: 'distributor',
    category: ['packaging'],
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
    contact: {
      email: 'orders@packright.com',
      phone: '(312) 555-0789',
      website: 'https://packright.com',
    },
    rating: 4.7,
    totalOrders: 234,
    avgDeliveryTime: 2,
    minOrderValue: 200,
    isVerified: true,
    specialties: ['Custom packaging', 'Eco-friendly materials', 'Bulk orders'],
    certifications: ['FSC Certified', 'Recycled Content'],
    createdAt: new Date('2023-01-05').toISOString(),
    lastOrderDate: new Date('2024-08-25').toISOString(),
  },
  {
    id: 'supplier-5',
    name: 'Local Farm Collective',
    type: 'local_farm',
    category: ['food_grade'],
    location: {
      city: 'Boulder',
      state: 'CO',
      country: 'USA',
    },
    contact: {
      email: 'harvest@localfarmco.com',
      phone: '(303) 555-0321',
    },
    rating: 4.9,
    totalOrders: 45,
    avgDeliveryTime: 1,
    minOrderValue: 100,
    isVerified: true,
    specialties: ['Seasonal produce', 'Organic vegetables', 'Herbs'],
    certifications: ['USDA Organic', 'Local Grown'],
    createdAt: new Date('2023-04-15').toISOString(),
    lastOrderDate: new Date('2024-08-28').toISOString(),
  },
];

const mockB2BProducts: B2BProduct[] = [
  {
    id: 'b2b-product-1',
    supplierId: 'supplier-1',
    supplierName: 'GrainCo Wholesale',
    name: 'Organic All-Purpose Flour',
    description: 'Premium organic all-purpose flour, perfect for artisan baking',
    category: 'food_grade',
    unit: 'kg',
    price: 1.15,
    minOrderQuantity: 50,
    maxOrderQuantity: 1000,
    inStock: true,
    stockQuantity: 5000,
    leadTime: 3,
    bulkDiscounts: [
      { minQuantity: 100, discountPercent: 5 },
      { minQuantity: 250, discountPercent: 10 },
      { minQuantity: 500, discountPercent: 15 },
    ],
    specifications: {
      'Protein Content': '10-12%',
      'Ash Content': '<0.5%',
      'Moisture': '<14%',
      'Origin': 'Kansas, USA',
    },
    images: ['/images/flour-organic.jpg'],
    isVerified: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-08-15').toISOString(),
  },
  {
    id: 'b2b-product-2',
    supplierId: 'supplier-2',
    supplierName: 'Mediterranean Oils Direct',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed extra virgin olive oil from Greek olives',
    category: 'food_grade',
    unit: 'liter',
    price: 11.50,
    minOrderQuantity: 20,
    maxOrderQuantity: 500,
    inStock: true,
    stockQuantity: 2000,
    leadTime: 14,
    bulkDiscounts: [
      { minQuantity: 50, discountPercent: 8 },
      { minQuantity: 100, discountPercent: 12 },
      { minQuantity: 200, discountPercent: 18 },
    ],
    specifications: {
      'Acidity': '<0.3%',
      'Origin': 'Kalamata, Greece',
      'Harvest': '2024',
      'Certification': 'PDO',
    },
    images: ['/images/olive-oil.jpg'],
    isVerified: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-08-10').toISOString(),
  },
  {
    id: 'b2b-product-3',
    supplierId: 'supplier-3',
    supplierName: 'Forest Lumber Co.',
    name: 'Oak Wood Planks',
    description: 'Premium grade oak planks, untreated and ready for crafting',
    category: 'raw_materials',
    unit: 'piece',
    price: 22.00,
    minOrderQuantity: 10,
    maxOrderQuantity: 100,
    inStock: true,
    stockQuantity: 500,
    leadTime: 7,
    bulkDiscounts: [
      { minQuantity: 25, discountPercent: 10 },
      { minQuantity: 50, discountPercent: 15 },
      { minQuantity: 100, discountPercent: 20 },
    ],
    specifications: {
      'Dimensions': '2" x 8" x 8\'',
      'Grade': 'Select',
      'Moisture': '<12%',
      'Certification': 'FSC',
    },
    images: ['/images/oak-planks.jpg'],
    isVerified: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-08-05').toISOString(),
  },
];

const mockSourcingRequests: SourcingRequest[] = [
  {
    id: 'sourcing-1',
    itemId: 'inv-1',
    itemName: 'All-Purpose Flour',
    requestedQuantity: 100,
    maxPrice: 1.20,
    urgency: 'high',
    status: 'quoted',
    quotes: [
      {
        supplierId: 'supplier-1',
        supplierName: 'GrainCo Wholesale',
        price: 1.15,
        leadTime: 3,
        totalCost: 115.00,
        isSelected: true,
        quotedAt: new Date('2024-08-30').toISOString(),
      },
      {
        supplierId: 'supplier-4',
        supplierName: 'PackRight Solutions',
        price: 1.25,
        leadTime: 2,
        totalCost: 125.00,
        isSelected: false,
        quotedAt: new Date('2024-08-30').toISOString(),
      },
    ],
    selectedQuote: {
      supplierId: 'supplier-1',
      supplierName: 'GrainCo Wholesale',
      price: 1.15,
      leadTime: 3,
      totalCost: 115.00,
      orderId: 'order-1',
    },
    createdAt: new Date('2024-08-29').toISOString(),
    updatedAt: new Date('2024-08-30').toISOString(),
  },
];

const mockB2BOrders: B2BOrder[] = [
  {
    id: 'order-1',
    supplierId: 'supplier-1',
    supplierName: 'GrainCo Wholesale',
    items: [
      {
        productId: 'b2b-product-1',
        productName: 'Organic All-Purpose Flour',
        quantity: 100,
        unitPrice: 1.15,
        totalPrice: 115.00,
      },
    ],
    totalAmount: 115.00,
    status: 'confirmed',
    orderDate: new Date('2024-08-30').toISOString(),
    expectedDelivery: new Date('2024-09-02').toISOString(),
    trackingNumber: 'GRN123456789',
    notes: 'Urgent order for low stock replenishment',
    createdAt: new Date('2024-08-30').toISOString(),
    updatedAt: new Date('2024-08-30').toISOString(),
  },
];

// GET /api/b2b/suppliers - Get all suppliers
b2bNetworkRouter.get('/b2b/suppliers', (req, res) => {
  try {
    const { type, category, verified, search } = req.query;
    
    let filteredSuppliers = [...mockSuppliers];
    
    if (type) {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.type === type);
    }
    
    if (category) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.category.includes(category as string)
      );
    }
    
    if (verified === 'true') {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.isVerified);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm))
      );
    }
    
    res.json({
      suppliers: filteredSuppliers,
      total: filteredSuppliers.length,
      summary: {
        verified: filteredSuppliers.filter(s => s.isVerified).length,
        averageRating: filteredSuppliers.reduce((sum, s) => sum + s.rating, 0) / filteredSuppliers.length,
        totalOrders: filteredSuppliers.reduce((sum, s) => sum + s.totalOrders, 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/b2b/suppliers/:id - Get supplier details
b2bNetworkRouter.get('/b2b/suppliers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const supplier = mockSuppliers.find(s => s.id === id);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    // Get supplier's products
    const products = mockB2BProducts.filter(p => p.supplierId === id);
    
    // Get recent orders
    const recentOrders = mockB2BOrders
      .filter(o => o.supplierId === id)
      .slice(0, 5);
    
    res.json({
      supplier,
      products,
      recentOrders,
      stats: {
        totalProducts: products.length,
        totalOrders: recentOrders.length,
        avgOrderValue: recentOrders.length > 0 
          ? recentOrders.reduce((sum, o) => sum + o.totalAmount, 0) / recentOrders.length 
          : 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching supplier details:', error);
    res.status(500).json({ error: 'Failed to fetch supplier details' });
  }
});

// GET /api/b2b/products - Get B2B products
b2bNetworkRouter.get('/b2b/products', (req, res) => {
  try {
    const { category, supplier, inStock, search, minPrice, maxPrice } = req.query;
    
    let filteredProducts = [...mockB2BProducts];
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    if (supplier) {
      filteredProducts = filteredProducts.filter(product => product.supplierId === supplier);
    }
    
    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(product => product.inStock);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => product.price >= Number(minPrice));
    }
    
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => product.price <= Number(maxPrice));
    }
    
    res.json({
      products: filteredProducts,
      total: filteredProducts.length,
      summary: {
        inStock: filteredProducts.filter(p => p.inStock).length,
        averagePrice: filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length,
        categories: [...new Set(filteredProducts.map(p => p.category))],
      },
    });
  } catch (error) {
    logger.error('Error fetching B2B products:', error);
    res.status(500).json({ error: 'Failed to fetch B2B products' });
  }
});

// GET /api/b2b/sourcing-requests - Get sourcing requests
b2bNetworkRouter.get('/b2b/sourcing-requests', (req, res) => {
  try {
    const { status, urgency } = req.query;
    
    let filteredRequests = [...mockSourcingRequests];
    
    if (status) {
      filteredRequests = filteredRequests.filter(request => request.status === status);
    }
    
    if (urgency) {
      filteredRequests = filteredRequests.filter(request => request.urgency === urgency);
    }
    
    res.json({
      requests: filteredRequests,
      total: filteredRequests.length,
      summary: {
        pending: filteredRequests.filter(r => r.status === 'pending').length,
        quoted: filteredRequests.filter(r => r.status === 'quoted').length,
        ordered: filteredRequests.filter(r => r.status === 'ordered').length,
        critical: filteredRequests.filter(r => r.urgency === 'critical').length,
      },
    });
  } catch (error) {
    logger.error('Error fetching sourcing requests:', error);
    res.status(500).json({ error: 'Failed to fetch sourcing requests' });
  }
});

// POST /api/b2b/sourcing-requests - Create sourcing request
b2bNetworkRouter.post('/b2b/sourcing-requests', (req, res) => {
  try {
    const { itemId, itemName, requestedQuantity, maxPrice, urgency } = req.body;
    
    const newRequest: SourcingRequest = {
      id: `sourcing-${Date.now()}`,
      itemId,
      itemName,
      requestedQuantity,
      maxPrice,
      urgency: urgency || 'medium',
      status: 'pending',
      quotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockSourcingRequests.push(newRequest);
    
    // Simulate automatic quote generation
    setTimeout(() => {
      const request = mockSourcingRequests.find(r => r.id === newRequest.id);
      if (request) {
        // Find matching products and generate quotes
        const matchingProducts = mockB2BProducts.filter(p => 
          p.name.toLowerCase().includes(itemName.toLowerCase()) ||
          p.category === 'food_grade' // Simplified matching
        );
        
        matchingProducts.slice(0, 3).forEach(product => {
          const supplier = mockSuppliers.find(s => s.id === product.supplierId);
          if (supplier) {
            const quote = {
              supplierId: supplier.id,
              supplierName: supplier.name,
              price: product.price,
              leadTime: product.leadTime,
              totalCost: product.price * requestedQuantity,
              isSelected: false,
              quotedAt: new Date().toISOString(),
            };
            request.quotes.push(quote);
          }
        });
        
        if (request.quotes.length > 0) {
          request.status = 'quoted';
          request.updatedAt = new Date().toISOString();
        }
      }
    }, 2000); // Simulate 2-second processing time
    
    res.status(201).json({
      success: true,
      request: newRequest,
      message: 'Sourcing request created. Quotes will be generated automatically.',
    });
  } catch (error) {
    logger.error('Error creating sourcing request:', error);
    res.status(500).json({ error: 'Failed to create sourcing request' });
  }
});

// POST /api/b2b/sourcing-requests/:id/select-quote - Select a quote
b2bNetworkRouter.post('/b2b/sourcing-requests/:id/select-quote', (req, res) => {
  try {
    const { id } = req.params;
    const { quoteIndex } = req.body;
    
    const request = mockSourcingRequests.find(r => r.id === id);
    if (!request) {
      return res.status(404).json({ error: 'Sourcing request not found' });
    }
    
    if (quoteIndex < 0 || quoteIndex >= request.quotes.length) {
      return res.status(400).json({ error: 'Invalid quote index' });
    }
    
    const selectedQuote = request.quotes[quoteIndex];
    selectedQuote.isSelected = true;
    
    // Unselect other quotes
    request.quotes.forEach((quote, index) => {
      if (index !== quoteIndex) {
        quote.isSelected = false;
      }
    });
    
    request.selectedQuote = {
      ...selectedQuote,
      orderId: `order-${Date.now()}`,
    };
    
    request.status = 'ordered';
    request.updatedAt = new Date().toISOString();
    
    // Create B2B order
    const newOrder: B2BOrder = {
      id: request.selectedQuote.orderId,
      supplierId: selectedQuote.supplierId,
      supplierName: selectedQuote.supplierName,
      items: [{
        productId: 'temp-product-id',
        productName: request.itemName,
        quantity: request.requestedQuantity,
        unitPrice: selectedQuote.price,
        totalPrice: selectedQuote.totalCost,
      }],
      totalAmount: selectedQuote.totalCost,
      status: 'pending',
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + selectedQuote.leadTime * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockB2BOrders.push(newOrder);
    
    res.json({
      success: true,
      request,
      order: newOrder,
      message: 'Quote selected and order created successfully.',
    });
  } catch (error) {
    logger.error('Error selecting quote:', error);
    res.status(500).json({ error: 'Failed to select quote' });
  }
});

// GET /api/b2b/orders - Get B2B orders
b2bNetworkRouter.get('/b2b/orders', (req, res) => {
  try {
    const { status, supplier } = req.query;
    
    let filteredOrders = [...mockB2BOrders];
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (supplier) {
      filteredOrders = filteredOrders.filter(order => order.supplierId === supplier);
    }
    
    res.json({
      orders: filteredOrders,
      total: filteredOrders.length,
      summary: {
        totalValue: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        pending: filteredOrders.filter(o => o.status === 'pending').length,
        confirmed: filteredOrders.filter(o => o.status === 'confirmed').length,
        shipped: filteredOrders.filter(o => o.status === 'shipped').length,
        delivered: filteredOrders.filter(o => o.status === 'delivered').length,
      },
    });
  } catch (error) {
    logger.error('Error fetching B2B orders:', error);
    res.status(500).json({ error: 'Failed to fetch B2B orders' });
  }
});

// GET /api/b2b/analytics - Get B2B analytics
b2bNetworkRouter.get('/b2b/analytics', (req, res) => {
  try {
    const totalOrders = mockB2BOrders.length;
    const totalValue = mockB2BOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;
    
    const supplierStats = mockSuppliers.map(supplier => {
      const supplierOrders = mockB2BOrders.filter(o => o.supplierId === supplier.id);
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        totalOrders: supplierOrders.length,
        totalValue: supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        avgDeliveryTime: supplier.avgDeliveryTime,
        rating: supplier.rating,
      };
    });
    
    const categoryStats = mockB2BProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, totalValue: 0 };
      }
      acc[product.category].count++;
      return acc;
    }, {} as Record<string, { count: number; totalValue: number }>);
    
    res.json({
      overview: {
        totalSuppliers: mockSuppliers.length,
        totalProducts: mockB2BProducts.length,
        totalOrders,
        totalValue,
        avgOrderValue,
        activeSourcingRequests: mockSourcingRequests.filter(r => r.status === 'pending' || r.status === 'quoted').length,
      },
      supplierStats,
      categoryStats,
      recentActivity: {
        newOrders: mockB2BOrders.filter(o => 
          new Date(o.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        newSourcingRequests: mockSourcingRequests.filter(r => 
          new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
        deliveredOrders: mockB2BOrders.filter(o => 
          o.status === 'delivered' && 
          new Date(o.actualDelivery || o.expectedDelivery) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
      },
    });
  } catch (error) {
    logger.error('Error fetching B2B analytics:', error);
    res.status(500).json({ error: 'Failed to fetch B2B analytics' });
  }
});

// POST /api/b2b/auto-source - Trigger automatic sourcing for low stock items
b2bNetworkRouter.post('/b2b/auto-source', (req, res) => {
  try {
    const { itemId, itemName, currentStock, reorderPoint, urgency } = req.body;
    
    // Check if sourcing request already exists
    const existingRequest = mockSourcingRequests.find(r => 
      r.itemId === itemId && (r.status === 'pending' || r.status === 'quoted')
    );
    
    if (existingRequest) {
      return res.json({
        success: false,
        message: 'Sourcing request already exists for this item',
        request: existingRequest,
      });
    }
    
    // Calculate suggested quantity (3x reorder point)
    const suggestedQuantity = Math.max(reorderPoint * 3, 50);
    
    const newRequest: SourcingRequest = {
      id: `sourcing-${Date.now()}`,
      itemId,
      itemName,
      requestedQuantity: suggestedQuantity,
      urgency: urgency || 'medium',
      status: 'pending',
      quotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockSourcingRequests.push(newRequest);
    
    // Simulate automatic quote generation
    setTimeout(() => {
      const request = mockSourcingRequests.find(r => r.id === newRequest.id);
      if (request) {
        // Find matching products and generate quotes
        const matchingProducts = mockB2BProducts.filter(p => 
          p.name.toLowerCase().includes(itemName.toLowerCase()) ||
          p.category === 'food_grade' // Simplified matching
        );
        
        matchingProducts.slice(0, 3).forEach(product => {
          const supplier = mockSuppliers.find(s => s.id === product.supplierId);
          if (supplier) {
            const quote = {
              supplierId: supplier.id,
              supplierName: supplier.name,
              price: product.price,
              leadTime: product.leadTime,
              totalCost: product.price * suggestedQuantity,
              isSelected: false,
              quotedAt: new Date().toISOString(),
            };
            request.quotes.push(quote);
          }
        });
        
        if (request.quotes.length > 0) {
          request.status = 'quoted';
          request.updatedAt = new Date().toISOString();
        }
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      request: newRequest,
      message: 'Automatic sourcing initiated. Quotes will be generated shortly.',
    });
  } catch (error) {
    logger.error('Error triggering auto-sourcing:', error);
    res.status(500).json({ error: 'Failed to trigger auto-sourcing' });
  }
});
