import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as vendorService from '../services/vendor.service';

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

// In-memory storage for orders (in a real app, this would be a database)
const ordersStorage: any[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2025-001',
    customerId: 'cust-1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@restaurantgroup.com',
    customerPhone: '(555) 123-4567',
    status: 'in_production',
    priority: 'high',
    salesWindowId: null,
    totalAmount: 1250.00,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Custom Aprons',
        quantity: 50,
        unitPrice: 15.00,
        totalPrice: 750.00,
        specifications: 'Red aprons with white logo, size M-L',
        status: 'in_production'
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Chef Hats',
        quantity: 25,
        unitPrice: 20.00,
        totalPrice: 500.00,
        specifications: 'White chef hats with embroidered logo',
        status: 'pending'
      }
    ],
    specialInstructions: 'Rush order for grand opening event',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
    expectedDeliveryDate: '2025-02-01',
    productionStartDate: '2025-01-18T09:00:00Z',
    assignedTo: 'Production Team A',
    tags: ['rush', 'restaurant', 'grand-opening']
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2025-002',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@deliveryapp.com',
    customerPhone: '(555) 987-6543',
    status: 'confirmed',
    priority: 'medium',
    salesWindowId: null,
    totalAmount: 850.00,
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        productName: 'Delivery Bags',
        quantity: 100,
        unitPrice: 8.50,
        totalPrice: 850.00,
        specifications: 'Insulated delivery bags with company logo',
        status: 'pending'
      }
    ],
    specialInstructions: 'Standard delivery timeline',
    createdAt: '2025-01-18T14:20:00Z',
    updatedAt: '2025-01-18T14:20:00Z',
    expectedDeliveryDate: '2025-02-15',
    assignedTo: 'Production Team B',
    tags: ['delivery', 'bags', 'standard']
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

// Get vendor orders
vendorRouter.get('/orders', async (req, res) => {
  try {
    // Return orders from storage (includes newly created orders)
    res.json({ success: true, data: ordersStorage });
  } catch (error: any) {
    console.error('FETCH_ORDERS_ERROR', error);
    res.status(500).json({ error: 'FETCH_ORDERS_FAILED', message: error.message });
  }
});

// Get sales windows
vendorRouter.get('/sales-windows', async (req, res) => {
  try {
    // Mock sales windows data - in real app, fetch from database
    const mockSalesWindows = [
      {
        id: 'window-1',
        name: 'Holiday Market 2024',
        status: 'active',
        startDate: '2024-12-01',
        endDate: '2024-12-24',
        description: 'Holiday market sales window'
      },
      {
        id: 'window-2',
        name: 'Spring Festival 2025',
        status: 'active',
        startDate: '2025-03-15',
        endDate: '2025-03-30',
        description: 'Spring festival sales window'
      },
      {
        id: 'window-3',
        name: 'Summer Pop-up',
        status: 'scheduled',
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        description: 'Summer pop-up sales window'
      }
    ];

    res.json({ success: true, data: mockSalesWindows });
  } catch (error: any) {
    console.error('FETCH_SALES_WINDOWS_ERROR', error);
    res.status(500).json({ error: 'FETCH_SALES_WINDOWS_FAILED', message: error.message });
  }
});

// Get customer order history
vendorRouter.get('/orders/history', async (req, res) => {
  try {
    // TODO: Add authentication check
    // if (!req.user || req.user.role !== 'CUSTOMER') {
    //   return res.status(403).json({ error: 'CUSTOMER_ACCESS_REQUIRED' });
    // }

    // TODO: Filter orders by customer ID from session
    // const customerId = req.user.id;
    // For now, return all orders (in a real app, filter by customer)
    
    // Mock customer orders data - in a real app, fetch from database
    const mockCustomerOrders = [
      {
        id: 'customer-order-1',
        orderNumber: 'ORD-CUST-001',
        status: 'COMPLETED',
        subtotal: 45.99,
        tax: 3.68,
        shipping: 5.99,
        total: 55.66,
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-18T14:30:00Z',
        items: [
          {
            id: 'item-1',
            quantity: 2,
            price: 8.99,
            total: 17.98,
            product: {
              id: 'prod-1',
              name: 'Artisan Sourdough Bread',
              imageUrl: '/images/sourdough.jpg',
              price: 8.99
            }
          },
          {
            id: 'item-2',
            quantity: 1,
            price: 4.50,
            total: 4.50,
            product: {
              id: 'prod-2',
              name: 'Chocolate Croissant',
              imageUrl: '/images/croissant.jpg',
              price: 4.50
            }
          }
        ],
        fulfillment: {
          id: 'fulfill-1',
          status: 'COMPLETED',
          type: 'PICKUP',
          trackingNumber: null,
          carrier: null,
          estimatedDelivery: '2025-01-18T16:00:00Z',
          actualDelivery: '2025-01-18T14:30:00Z',
          notes: 'Order ready for pickup'
        },
        shippingAddress: {
          id: 'addr-1',
          firstName: 'John',
          lastName: 'Doe',
          company: null,
          address1: '123 Main St',
          address2: null,
          city: 'Atlanta',
          state: 'GA',
          postalCode: '30309',
          country: 'USA',
          phone: '(555) 123-4567'
        }
      },
      {
        id: 'customer-order-2',
        orderNumber: 'ORD-CUST-002',
        status: 'IN_PROGRESS',
        subtotal: 32.25,
        tax: 2.58,
        shipping: 0,
        total: 34.83,
        createdAt: '2025-01-20T09:15:00Z',
        updatedAt: '2025-01-21T11:00:00Z',
        items: [
          {
            id: 'item-3',
            quantity: 3,
            price: 5.25,
            total: 15.75,
            product: {
              id: 'prod-3',
              name: 'Cinnamon Roll',
              imageUrl: '/images/cinnamon-roll.jpg',
              price: 5.25
            }
          },
          {
            id: 'item-4',
            quantity: 2,
            price: 8.25,
            total: 16.50,
            product: {
              id: 'prod-4',
              name: 'Apple Fritter',
              imageUrl: '/images/apple-fritter.jpg',
              price: 8.25
            }
          }
        ],
        fulfillment: {
          id: 'fulfill-2',
          status: 'IN_PROGRESS',
          type: 'SHIPPING',
          trackingNumber: 'TRK123456789',
          carrier: 'UPS',
          estimatedDelivery: '2025-01-25T18:00:00Z',
          actualDelivery: null,
          notes: 'In production - estimated ready by tomorrow'
        },
        shippingAddress: {
          id: 'addr-2',
          firstName: 'Jane',
          lastName: 'Smith',
          company: null,
          address1: '456 Oak Ave',
          address2: 'Apt 2B',
          city: 'Atlanta',
          state: 'GA',
          postalCode: '30305',
          country: 'USA',
          phone: '(555) 987-6543'
        }
      }
    ];

    res.json({ orders: mockCustomerOrders });
  } catch (error: any) {
    console.error('CUSTOMER_ORDERS_HISTORY_ERROR', error);
    res.status(500).json({ error: 'ORDERS_FETCH_FAILED', message: error.message });
  }
});

// Create new order
vendorRouter.post('/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderDate,
      expectedDeliveryDate,
      status = 'pending',
      priority = 'medium',
      salesWindowId,
      items,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR', 
        message: 'Customer name, email, and at least one item are required' 
      });
    }

    // Generate order ID and number
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Create order object
    const newOrder = {
      id: orderId,
      orderNumber,
      customerId: `customer-${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      status,
      priority,
      salesWindowId: salesWindowId || null,
      totalAmount,
      items: items.map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        productId: item.productId || `product-${index}`,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        specifications: item.specifications || '',
        status: 'pending' as const
      })),
      specialInstructions: specialInstructions || '',
      createdAt: orderDate || new Date().toISOString(),
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      updatedAt: new Date().toISOString(),
      tags: [] // Add empty tags array to prevent undefined errors
    };

    // Add to orders storage
    ordersStorage.push(newOrder);
    console.log('NEW_ORDER_CREATED', newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });

  } catch (error: any) {
    console.error('ORDER_CREATION_ERROR', error);
    res.status(500).json({ 
      error: 'ORDER_CREATION_FAILED', 
      message: error.message 
    });
  }
});

// Wave 3: Vendor Dashboard endpoints

// GET /api/vendor/me
vendorRouter.get('/vendor/me', requireAuth, async (req, res, next) => {
  try {
    const vendor = await vendorService.findVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    return res.json(vendor);
  } catch (error: any) {
    return next(error);
  }
});

// GET /api/vendor/products
vendorRouter.get('/vendor/products', requireAuth, async (req, res, next) => {
  try {
    const vendor = await vendorService.findVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const products = await vendorService.getVendorProducts(vendor.id);
    return res.json(products);
  } catch (error: any) {
    return next(error);
  }
});

// GET /api/vendor/inventory
vendorRouter.get('/vendor/inventory', requireAuth, async (req, res, next) => {
  try {
    const vendor = await vendorService.findVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const inventory = await vendorService.getVendorInventory(vendor.id);
    return res.json(inventory);
  } catch (error: any) {
    return next(error);
  }
});

// GET /api/vendor/orders
vendorRouter.get('/vendor/orders', requireAuth, async (req, res, next) => {
  try {
    const vendor = await vendorService.findVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const result = await vendorService.getVendorOrders(vendor.id);
    return res.json(result);
  } catch (error: any) {
    return next(error);
  }
});

// GET /api/vendor/recipes
vendorRouter.get('/vendor/recipes', requireAuth, async (req, res, next) => {
  try {
    const vendor = await vendorService.findVendorByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const recipes = await vendorService.getVendorRecipes(vendor.id);
    return res.json(recipes);
  } catch (error: any) {
    return next(error);
  }
});