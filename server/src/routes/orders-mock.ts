import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth-mock';
import { sendDeliveryConfirmation, sendDeliveryETAWithTime } from '../utils/twilio';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Validation schemas
const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive().int(),
  price: z.number().positive()
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Cart must contain at least one item'),
  userId: z.string().uuid(),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),
  shippingAddressId: z.string().uuid().optional(),
  notes: z.string().optional(),
  prediction: z.object({
    predictedFulfillmentTime: z.string(),
    label: z.string(),
    baseEstimate: z.number(),
    prepTime: z.number(),
    shippingTime: z.number()
  }).optional()
});

// Mock data
const mockOrders: any[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-1234567890-ABC123',
    status: 'PENDING',
    subtotal: 51.98,
    tax: 4.42,
    shipping: 0,
    total: 56.40,
    notes: 'Test order for delivery confirmation',
    userId: 'test-user-123',
    shippingAddressId: 'mock-address-id',
    shippingZip: '97201',
    deliveryDay: 'Monday',
    deliveryStatus: 'pending',
    deliveryTimestamp: null,
    deliveryPhotoUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orderItems: [
      {
        id: 'order-item-1-0',
        quantity: 2,
        price: 25.99,
        total: 51.98,
        orderId: 'order-1',
        productId: '550e8400-e29b-41d4-a716-446655440000'
      }
    ],
    fulfillment: {
      id: 'fulfillment-1',
      fulfillmentType: 'SHIPPING',
      status: 'PENDING',
      orderId: 'order-1',
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      actualDelivery: null,
      notes: null,
      etaLabel: '⚡ Fast Fulfillment',
      predictedHours: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
];
let orderCounter = 2;

// POST /api/orders/checkout - Create a new order from cart items
router.post('/checkout', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    // Validate request body
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { items, userId, subtotal, tax, shipping, total, shippingAddressId, notes, prediction } = validationResult.data;

    // Verify user is creating order for themselves
    if (req.session.userId !== userId) {
      return res.status(400).json({
        error: 'Unauthorized',
        message: 'You can only create orders for yourself'
      });
    }

    // Mock product validation
    const mockProducts = [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Handcrafted Ceramic Mug', price: 25.99, stock: 10 },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Artisan Soap', price: 8.99, stock: 50 },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Wooden Cutting Board', price: 45.99, stock: 5 }
    ];

    // Validate all products exist
    const productIds = items.map(item => item.productId);
    const products = mockProducts.filter(p => productIds.includes(p.id));

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error: 'Invalid products',
        message: 'One or more products are not available or do not exist'
      });
    }

    // Validate stock levels
    const stockValidationErrors: string[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        stockValidationErrors.push(
          `${product.name}: requested ${item.quantity}, available ${product.stock}`
        );
      }
    }

    if (stockValidationErrors.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: 'Some items have insufficient stock',
        details: stockValidationErrors
      });
    }

    // Validate price consistency
    const priceValidationErrors: string[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && Math.abs(product.price - item.price) > 0.01) {
        priceValidationErrors.push(
          `${product.name}: expected $${product.price}, received $${item.price}`
        );
      }
    }

    if (priceValidationErrors.length > 0) {
      return res.status(400).json({
        error: 'Price mismatch',
        message: 'Product prices have changed',
        details: priceValidationErrors
      });
    }

    // Recalculate totals to ensure accuracy
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const calculatedTax = calculatedSubtotal * 0.085; // 8.5% tax rate
    const calculatedShipping = calculatedSubtotal >= 50 ? 0 : 5.99;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

    // Validate totals match (allow small rounding differences)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        error: 'Total mismatch',
        message: 'Order total does not match calculated total',
        expected: calculatedTotal,
        received: total
      });
    }

    // Auto-assign delivery day based on ZIP code (mock implementation)
    function getNextAvailableDay(zip: string): string {
      const dayMap: Record<string, string> = {
        '30248': 'Monday',
        '30252': 'Tuesday', 
        '30236': 'Wednesday',
        '30301': 'Thursday',
        '30302': 'Friday',
        '30303': 'Saturday',
        '30304': 'Sunday',
        '30305': 'Monday',
        '30306': 'Tuesday',
        '30307': 'Wednesday',
        '30308': 'Thursday',
        '30309': 'Friday',
        '30310': 'Saturday',
        '30311': 'Sunday',
        '30312': 'Monday',
        '30313': 'Tuesday',
        '30314': 'Wednesday',
        '30315': 'Thursday',
        '30316': 'Friday',
        '30317': 'Saturday',
        '30318': 'Sunday',
        '30319': 'Monday',
        '30320': 'Tuesday',
        '30321': 'Wednesday',
        '30322': 'Thursday',
        '30323': 'Friday',
        '30324': 'Saturday',
        '30325': 'Sunday',
        '30326': 'Monday',
        '30327': 'Tuesday',
        '30328': 'Wednesday',
        '30329': 'Thursday',
        '30330': 'Friday',
        '30331': 'Saturday',
        '30332': 'Sunday',
        '30333': 'Monday',
        '30334': 'Tuesday',
        '30335': 'Wednesday',
        '30336': 'Thursday',
        '30337': 'Friday',
        '30338': 'Saturday',
        '30339': 'Sunday',
        '30340': 'Monday',
        '30341': 'Tuesday',
        '30342': 'Wednesday',
        '30343': 'Thursday',
        '30344': 'Friday',
        '30345': 'Saturday',
        '30346': 'Sunday',
        '30347': 'Monday',
        '30348': 'Tuesday',
        '30349': 'Wednesday',
        '30350': 'Thursday'
      };
      return dayMap[zip] || 'Friday'; // Default to Friday for unknown ZIPs
    }

    // Mock shipping address with ZIP code
    const mockShippingZip = '30301'; // Default mock ZIP
    const deliveryDay = getNextAvailableDay(mockShippingZip);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create mock order
    const newOrder = {
      id: `order-${orderCounter++}`,
      orderNumber,
      status: 'PENDING',
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      shipping: calculatedShipping,
      total: calculatedTotal,
      notes,
      userId,
      shippingAddressId: shippingAddressId || 'mock-address-id',
      shippingZip: mockShippingZip,
      deliveryDay,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create mock order items
    const orderItems = items.map((item, index) => ({
      id: `order-item-${orderCounter}-${index}`,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      orderId: newOrder.id,
      productId: item.productId
    }));

    // Create mock fulfillment
    const fulfillment = {
      id: `fulfillment-${orderCounter}`,
      fulfillmentType: 'SHIPPING',
      status: 'PENDING',
      orderId: newOrder.id,
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      actualDelivery: null,
      notes: null,
      etaLabel: prediction?.label || null,
      predictedHours: prediction?.baseEstimate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data
    mockOrders.push({
      ...newOrder,
      orderItems,
      fulfillment
    });

    // Return success response
    return res.status(400).json({
      message: 'Order created successfully',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        total: newOrder.total,
        createdAt: newOrder.createdAt
      },
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      fulfillment: {
        id: fulfillment.id,
        status: fulfillment.status,
        type: fulfillment.fulfillmentType
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to process checkout'
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const userOrders = mockOrders.filter(order => order.userId === req.session.userId);

    return res.json({
      orders: userOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.productId,
            name: `Product ${item.productId.slice(-4)}`,
            imageUrl: null
          }
        })),
        fulfillment: {
          id: order.fulfillment.id,
          status: order.fulfillment.status,
          type: order.fulfillment.fulfillmentType,
          trackingNumber: order.fulfillment.trackingNumber,
          estimatedDelivery: order.fulfillment.estimatedDelivery,
          etaLabel: order.fulfillment.etaLabel,
          predictedHours: order.fulfillment.predictedHours
        },
        shippingAddress: {
          id: order.shippingAddressId,
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201'
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/history - Get customer order history
router.get('/history', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const customerOrders = mockOrders
      .filter(order => order.userId === req.session.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formattedOrders = customerOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingZip: order.shippingZip || '30301',
      deliveryDay: order.deliveryDay || 'Thursday',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.productId,
          name: `Product ${item.productId.slice(-4)}`,
          imageUrl: null,
          price: item.price
        }
      })),
      fulfillment: {
        id: order.fulfillment.id,
        status: order.fulfillment.status,
        type: order.fulfillment.fulfillmentType,
        trackingNumber: order.fulfillment.trackingNumber,
        carrier: order.fulfillment.carrier,
        estimatedDelivery: order.fulfillment.estimatedDelivery,
        actualDelivery: order.fulfillment.actualDelivery,
        notes: order.fulfillment.notes
      },
      shippingAddress: {
        id: order.shippingAddressId,
        firstName: 'John',
        lastName: 'Doe',
        company: null,
        address1: '123 Main St',
        address2: null,
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'US',
        phone: null
      }
    }));

    return res.json({
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order history'
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { id } = req.params;

    const order = mockOrders.find(o => o.id === id && o.userId === req.session.userId);

    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist or does not belong to you'
      });
    }

          return res.json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          shippingZip: order.shippingZip || '30301',
          deliveryDay: order.deliveryDay || 'Thursday',
          notes: order.notes,
          trackingNumber: order.trackingNumber,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.productId,
            name: `Product ${item.productId.slice(-4)}`,
            description: 'Mock product description',
            imageUrl: null,
            price: item.price
          }
        })),
        fulfillment: {
          id: order.fulfillment.id,
          status: order.fulfillment.status,
          type: order.fulfillment.fulfillmentType,
          trackingNumber: order.fulfillment.trackingNumber,
          carrier: order.fulfillment.carrier,
          estimatedDelivery: order.fulfillment.estimatedDelivery,
          actualDelivery: order.fulfillment.actualDelivery,
          notes: order.fulfillment.notes,
          etaLabel: order.fulfillment.etaLabel,
          predictedHours: order.fulfillment.predictedHours
        },
        shippingAddress: {
          id: order.shippingAddressId,
          firstName: 'John',
          lastName: 'Doe',
          company: null,
          address1: '123 Main St',
          address2: null,
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
          phone: null
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

// POST /api/orders/:id/confirm-delivery - Confirm delivery with optional photo
router.post('/:id/confirm-delivery', requireAuth, requireRole(['VENDOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;

    // Find the order
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Update order delivery status
    order.deliveryStatus = 'delivered';
    order.deliveryTimestamp = new Date().toISOString();
    order.deliveryPhotoUrl = photoUrl || null;
    order.status = 'DELIVERED';
    order.deliveredAt = new Date().toISOString();

    // Update fulfillment status
    if (order.fulfillment) {
      order.fulfillment.status = 'DELIVERED';
      order.fulfillment.actualDelivery = new Date().toISOString();
    }

    // Send customer notifications
    console.log(`📧 Customer notification sent for order ${order.orderNumber}`);
    
    // Mock phone number for testing Twilio integration
    const mockPhone = '+15551234567';
    await sendDeliveryConfirmation(mockPhone, order.orderNumber);

    return res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
        deliveryTimestamp: order.deliveryTimestamp,
        deliveryPhotoUrl: order.deliveryPhotoUrl,
        status: order.status,
        deliveredAt: order.deliveredAt
      }
    });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to confirm delivery'
    });
  }
});

// POST /api/orders/checkout/test - Test endpoint without authentication
router.post('/checkout/test', async (req, res) => {
  try {
    // Validate request body
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { items, userId, subtotal, tax, shipping, total, shippingAddressId, notes, prediction } = validationResult.data;

    // Mock product validation
    const mockProducts = [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Handcrafted Ceramic Mug', price: 25.99, stock: 10 },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Artisan Soap', price: 8.99, stock: 50 },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Wooden Cutting Board', price: 45.99, stock: 5 }
    ];

    // Validate all products exist
    const productIds = items.map(item => item.productId);
    const products = mockProducts.filter(p => productIds.includes(p.id));

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error: 'Invalid products',
        message: 'One or more products are not available or do not exist'
      });
    }

    // Auto-assign delivery day based on ZIP code (mock implementation)
    function getNextAvailableDay(zip: string): string {
      const dayMap: Record<string, string> = {
        '97201': 'Monday',
        '97202': 'Tuesday', 
        '97203': 'Wednesday',
        '97204': 'Thursday',
        '97205': 'Friday',
        '97206': 'Saturday',
        '97207': 'Sunday',
        '97208': 'Monday',
        '97209': 'Tuesday',
        '97210': 'Wednesday',
        '97211': 'Thursday',
        '97212': 'Friday',
        '97213': 'Saturday',
        '97214': 'Sunday',
        '97215': 'Monday',
        '97216': 'Tuesday',
        '97217': 'Wednesday',
        '97218': 'Thursday',
        '97219': 'Friday',
        '97220': 'Saturday',
        '97221': 'Sunday',
        '97222': 'Monday',
        '97223': 'Tuesday',
        '97224': 'Wednesday',
        '97225': 'Thursday',
        '97226': 'Friday',
        '97227': 'Saturday',
        '97228': 'Sunday',
        '97229': 'Monday',
        '97230': 'Tuesday',
        '97231': 'Wednesday',
        '97232': 'Thursday',
        '97233': 'Friday',
        '97234': 'Saturday',
        '97235': 'Sunday',
        '97236': 'Monday',
        '97237': 'Tuesday',
        '97238': 'Wednesday',
        '97239': 'Thursday',
        '97240': 'Friday',
        '97241': 'Saturday',
        '97242': 'Sunday',
        '97243': 'Monday',
        '97244': 'Tuesday',
        '97245': 'Wednesday',
        '97246': 'Thursday',
        '97247': 'Friday',
        '97248': 'Saturday',
        '97249': 'Sunday',
        '97250': 'Monday',
        '97251': 'Tuesday',
        '97252': 'Wednesday',
        '97253': 'Thursday',
        '97254': 'Friday',
        '97255': 'Saturday',
        '97256': 'Sunday',
        '97257': 'Monday',
        '97258': 'Tuesday',
        '97259': 'Wednesday',
        '97260': 'Thursday',
        '97261': 'Friday',
        '97262': 'Saturday',
        '97263': 'Sunday',
        '97264': 'Monday',
        '97265': 'Tuesday',
        '97266': 'Wednesday',
        '97267': 'Thursday',
        '97268': 'Friday',
        '97269': 'Saturday',
        '97270': 'Sunday',
        '97271': 'Monday',
        '97272': 'Tuesday',
        '97273': 'Wednesday',
        '97274': 'Thursday',
        '97275': 'Friday',
        '97276': 'Saturday',
        '97277': 'Sunday',
        '97278': 'Monday',
        '97279': 'Tuesday',
        '97280': 'Wednesday',
        '97281': 'Thursday',
        '97282': 'Friday',
        '97283': 'Saturday',
        '97284': 'Sunday',
        '97285': 'Monday',
        '97286': 'Tuesday',
        '97287': 'Wednesday',
        '97288': 'Thursday',
        '97289': 'Friday',
        '97290': 'Saturday',
        '97291': 'Sunday',
        '97292': 'Monday',
        '97293': 'Tuesday',
        '97294': 'Wednesday',
        '97295': 'Thursday',
        '97296': 'Friday',
        '97297': 'Saturday',
        '97298': 'Sunday',
        '97299': 'Monday'
      };
      return dayMap[zip] || 'Friday'; // Default to Friday for unknown ZIPs
    }

    // Mock shipping address with ZIP code
    const mockShippingZip = '97201'; // Default mock ZIP
    const deliveryDay = getNextAvailableDay(mockShippingZip);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create mock order
    const newOrder = {
      id: `order-${orderCounter++}`,
      orderNumber,
      status: 'PENDING',
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      notes,
      userId,
      shippingAddressId: shippingAddressId || 'mock-address-id',
      shippingZip: mockShippingZip,
      deliveryDay,
      deliveryStatus: 'pending',
      deliveryTimestamp: null,
      deliveryPhotoUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create mock order items
    const orderItems = items.map((item, index) => ({
      id: `order-item-${orderCounter}-${index}`,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      orderId: newOrder.id,
      productId: item.productId
    }));

    // Create mock fulfillment
    const fulfillment = {
      id: `fulfillment-${orderCounter}`,
      fulfillmentType: 'SHIPPING',
      status: 'PENDING',
      orderId: newOrder.id,
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      actualDelivery: null,
      notes: null,
      etaLabel: prediction?.label || null,
      predictedHours: prediction?.baseEstimate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data
    mockOrders.push({
      ...newOrder,
      orderItems,
      fulfillment
    });

    // Return success response
    return res.status(400).json({
      message: 'Order created successfully',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        total: newOrder.total,
        createdAt: newOrder.createdAt
      },
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      fulfillment: {
        id: fulfillment.id,
        status: fulfillment.status,
        type: fulfillment.fulfillmentType
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to process checkout'
    });
  }
});

// GET /api/orders/history/test - Test endpoint without authentication
router.get('/history/test', async (req, res) => {
  try {
    const formattedOrders = mockOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingZip: order.shippingZip || '97201',
      deliveryDay: order.deliveryDay || 'Thursday',
      deliveryStatus: order.deliveryStatus || 'pending',
      deliveryTimestamp: order.deliveryTimestamp,
      deliveryPhotoUrl: order.deliveryPhotoUrl,
      notes: order.notes,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.productId,
          name: `Product ${item.productId.slice(-4)}`,
          description: 'Mock product description',
          imageUrl: null,
          price: item.price
        }
      })),
      fulfillment: {
        id: order.fulfillment.id,
        status: order.fulfillment.status,
        type: order.fulfillment.fulfillmentType,
        trackingNumber: order.fulfillment.trackingNumber,
        carrier: order.fulfillment.carrier,
        estimatedDelivery: order.fulfillment.estimatedDelivery,
        actualDelivery: order.fulfillment.actualDelivery,
        notes: order.fulfillment.notes,
        etaLabel: order.fulfillment.etaLabel,
        predictedHours: order.fulfillment.predictedHours
      },
      shippingAddress: {
        id: order.shippingAddressId,
        firstName: 'John',
        lastName: 'Doe',
        company: null,
        address1: '123 Main St',
        address2: null,
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'US',
        phone: null
      }
    }));

    return res.json({
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order history'
    });
  }
});

// POST /api/orders/:id/confirm-delivery/test - Test endpoint without authentication
router.post('/:id/confirm-delivery/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl } = req.body;

    // Find the order
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Update order delivery status
    order.deliveryStatus = 'delivered';
    order.deliveryTimestamp = new Date().toISOString();
    order.deliveryPhotoUrl = photoUrl || null;
    order.status = 'DELIVERED';
    order.deliveredAt = new Date().toISOString();

    // Update fulfillment status
    if (order.fulfillment) {
      order.fulfillment.status = 'DELIVERED';
      order.fulfillment.actualDelivery = new Date().toISOString();
    }

    // Send customer notifications
    console.log(`📧 Customer notification sent for order ${order.orderNumber}`);
    
    // Mock phone number for testing Twilio integration
    const mockPhone = '+15551234567';
    await sendDeliveryConfirmation(mockPhone, order.orderNumber);

    return res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
        deliveryTimestamp: order.deliveryTimestamp,
        deliveryPhotoUrl: order.deliveryPhotoUrl,
        status: order.status,
        deliveredAt: order.deliveredAt
      }
    });
  } catch (error) {
    console.error('Error confirming delivery:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to confirm delivery'
    });
  }
});

// POST /api/orders/:id/send-eta/test - Test endpoint for sending ETA notifications
router.post('/:id/send-eta/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { timeWindow } = req.body;

    // Find the order
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Mock phone number for testing Twilio integration
    const mockPhone = '+15551234567';
    
    // Send ETA notification via Twilio
    await sendDeliveryETAWithTime(
      mockPhone,
      'Rose Creek',
      timeWindow || '3-5 PM',
      order.orderNumber
    );

    return res.json({
      success: true,
      message: 'Delivery ETA notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending ETA notification:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to send ETA notification'
    });
  }
});

// GET /api/orders/:id/receipt/test - Test endpoint for generating PDF receipt
router.get('/:id/receipt/test', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = mockOrders.find(o => o.id === id);
    
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${order.orderNumber}.pdf"`);
    doc.pipe(res);

    // Add header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Craved Artisan', { align: 'center' });
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Delivery Receipt', { align: 'center' });
    
    doc.moveDown(0.5);

    // Add order details
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Order Number: ${order.orderNumber}`)
       .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
       .text(`Status: ${order.status}`)
       .text(`Delivery Status: ${order.deliveryStatus || 'Pending'}`);
    
    if (order.deliveryTimestamp) {
      const deliveryDate = new Date(order.deliveryTimestamp);
      doc.text(`Delivered: ${deliveryDate.toLocaleDateString()} at ${deliveryDate.toLocaleTimeString()}`);
    }
    
    doc.moveDown(0.5);

    // Add vendor information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Vendor Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('Vendor: Rose Creek Artisan Foods')
       .text('Email: info@rosecreek.com');
    
    doc.moveDown(0.5);

    // Add customer information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Customer Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('Customer: John Doe')
       .text('Email: john.doe@example.com')
       .text('Phone: +1 (555) 123-4567');
    
    doc.moveDown(0.5);

    // Add shipping address
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Shipping Address');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('123 Main Street')
       .text('Portland, OR 97201');
    
    doc.moveDown(0.5);

    // Add order items
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Items');
    
    doc.moveDown(0.25);

    order.orderItems.forEach((item: any, index: number) => {
      const itemName = `Product ${item.productId.slice(-4)}`;
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(itemName);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Quantity: ${item.quantity}`, { indent: 10 })
         .text(`Price: $${item.price.toFixed(2)}`, { indent: 10 })
         .text(`Subtotal: $${(item.quantity * item.price).toFixed(2)}`, { indent: 10 });
      
      doc.moveDown(0.25);
    });

    // Add totals
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Order Summary');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Subtotal: $${order.subtotal.toFixed(2)}`)
       .text(`Tax: $${order.tax.toFixed(2)}`)
       .text(`Shipping: $${order.shipping.toFixed(2)}`)
       .text(`Total: $${order.total.toFixed(2)}`, { continued: false });
    
    doc.moveDown(0.5);

    // Add notes if any
    if (order.notes) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Order Notes');
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(order.notes);
      
      doc.moveDown(0.5);
    }

    // Add footer
    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for choosing Craved Artisan!', { align: 'center' })
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });

    // End the document
    doc.end();
  } catch (error) {
    console.error('Error generating receipt:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to generate receipt'
    });
  }
});

export default router; 