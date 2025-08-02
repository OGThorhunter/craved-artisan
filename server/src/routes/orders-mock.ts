import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth-mock';

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
  notes: z.string().optional()
});

// Mock data
const mockOrders: any[] = [];
let orderCounter = 1;

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

    const { items, userId, subtotal, tax, shipping, total, shippingAddressId, notes } = validationResult.data;

    // Verify user is creating order for themselves
    if (req.session.userId !== userId) {
      return res.status(403).json({
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
    res.status(201).json({
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process checkout'
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const userOrders = mockOrders.filter(order => order.userId === req.session.userId);

    res.json({
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
          estimatedDelivery: order.fulfillment.estimatedDelivery
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
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { id } = req.params;

    const order = mockOrders.find(o => o.id === id && o.userId === req.session.userId);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist or does not belong to you'
      });
    }

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
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
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

export default router; 