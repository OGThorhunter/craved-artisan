import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth-mock';

// Define Role enum to match auth-mock
enum Role {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  SUPPLIER = 'SUPPLIER',
  EVENT_COORDINATOR = 'EVENT_COORDINATOR',
  DROPOFF = 'DROPOFF'
}

const router = express.Router();

// Validation schemas
const updateFulfillmentSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  notes: z.string().optional()
});

// Mock data
const mockVendorOrders: any[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-1234567890-ABC12',
    status: 'PENDING',
    subtotal: 89.97,
    total: 97.61,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    customer: {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    shippingAddress: {
      id: 'address-1',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201'
    },
    items: [
      {
        id: 'item-1',
        quantity: 2,
        price: 25.99,
        total: 51.98,
        product: {
          id: 'product-1',
          name: 'Handcrafted Ceramic Mug',
          imageUrl: null
        }
      },
      {
        id: 'item-2',
        quantity: 1,
        price: 37.99,
        total: 37.99,
        product: {
          id: 'product-2',
          name: 'Artisan Soap',
          imageUrl: null
        }
      }
    ],
    fulfillment: {
      id: 'fulfillment-1',
      status: 'PENDING',
      type: 'SHIPPING',
      trackingNumber: null,
      carrier: null,
      estimatedDelivery: null,
      actualDelivery: null,
      notes: null,
      etaLabel: '⚡ Fast Fulfillment',
      predictedHours: 2
    }
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-1234567891-DEF34',
    status: 'IN_PROGRESS',
    subtotal: 45.99,
    total: 49.89,
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
    customer: {
      id: 'customer-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    shippingAddress: {
      id: 'address-2',
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '456 Oak Ave',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101'
    },
    items: [
      {
        id: 'item-3',
        quantity: 1,
        price: 45.99,
        total: 45.99,
        product: {
          id: 'product-3',
          name: 'Wooden Cutting Board',
          imageUrl: null
        }
      }
    ],
    fulfillment: {
      id: 'fulfillment-2',
      status: 'IN_PROGRESS',
      type: 'SHIPPING',
      trackingNumber: '1Z999AA1234567890',
      carrier: 'UPS',
      estimatedDelivery: '2024-01-18T12:00:00Z',
      actualDelivery: null,
      notes: 'Package picked up by carrier',
      etaLabel: '📦 Standard',
      predictedHours: 34
    }
  }
];

// GET /api/vendor/orders - Get all orders for vendor's products
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    res.json({
      orders: mockVendorOrders
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/vendor/orders/stats - Get order statistics
router.get('/stats', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const totalOrders = mockVendorOrders.length;
    const pendingOrders = mockVendorOrders.filter(o => o.fulfillment.status === 'PENDING').length;
    const inProgressOrders = mockVendorOrders.filter(o => o.fulfillment.status === 'IN_PROGRESS').length;
    const completedOrders = mockVendorOrders.filter(o => o.fulfillment.status === 'COMPLETED').length;
    const totalRevenue = mockVendorOrders.reduce((sum, order) => sum + order.subtotal, 0);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching vendor order stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order statistics'
    });
  }
});

// GET /api/vendor/orders/:id - Get specific order details
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const order = mockVendorOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist or does not contain your products'
      });
    }

    res.json({
      order: {
        ...order,
        customer: {
          ...order.customer,
          phone: '+1-555-0123'
        },
        shippingAddress: {
          ...order.shippingAddress,
          company: null,
          address2: null,
          country: 'US',
          phone: null
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendor order:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
});

// PATCH /api/vendor/orders/:id/fulfillment - Update fulfillment status
router.patch('/:id/fulfillment', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = updateFulfillmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.issues
      });
    }

    const { status, trackingNumber, carrier, estimatedDelivery, notes } = validationResult.data;

    const order = mockVendorOrders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Order does not exist or does not contain your products'
      });
    }

    // Update fulfillment
    order.fulfillment = {
      ...order.fulfillment,
      status,
      trackingNumber: trackingNumber || null,
      carrier: carrier || null,
      estimatedDelivery: estimatedDelivery || null,
      notes: notes || null,
      actualDelivery: status === 'COMPLETED' ? new Date().toISOString() : null
    };

    // Update order status if fulfillment is completed
    if (status === 'COMPLETED') {
      order.status = 'FULFILLED';
    }

    order.updatedAt = new Date().toISOString();

    res.json({
      message: 'Fulfillment updated successfully',
      fulfillment: order.fulfillment
    });
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update fulfillment'
    });
  }
});

// GET /api/vendor/orders/delivery-batches - Get orders grouped by delivery day
router.get('/delivery-batches', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { optimize = 'false' } = req.query;
    
    // Mock delivery batches data
    const mockBatches = {
      'Monday': [
        {
          id: 'order-1',
          orderNumber: 'ORD-1234567890-ABC',
          status: 'PENDING',
          total: 89.97,
          createdAt: '2025-08-02T10:00:00Z',
          customerName: 'John Smith',
          customerEmail: 'john@example.com',
          shippingZip: '30248',
          shippingCity: 'Atlanta',
          shippingState: 'GA',
          items: [
            { id: 'item-1', quantity: 2, productName: 'Handcrafted Ceramic Mug', productImage: null },
            { id: 'item-2', quantity: 1, productName: 'Artisan Soap', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '⚡ Fast Fulfillment'
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-1234567891-DEF',
          status: 'CONFIRMED',
          total: 45.99,
          createdAt: '2025-08-02T11:30:00Z',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@example.com',
          shippingZip: '30248',
          shippingCity: 'Atlanta',
          shippingState: 'GA',
          items: [
            { id: 'item-3', quantity: 1, productName: 'Wooden Cutting Board', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '📦 Standard'
        }
      ],
      'Tuesday': [
        {
          id: 'order-3',
          orderNumber: 'ORD-1234567892-GHI',
          status: 'PENDING',
          total: 34.98,
          createdAt: '2025-08-02T14:15:00Z',
          customerName: 'Mike Wilson',
          customerEmail: 'mike@example.com',
          shippingZip: '30252',
          shippingCity: 'Decatur',
          shippingState: 'GA',
          items: [
            { id: 'item-4', quantity: 1, productName: 'Handcrafted Ceramic Mug', productImage: null },
            { id: 'item-5', quantity: 1, productName: 'Artisan Soap', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '⚡ Fast Fulfillment'
        }
      ],
      'Wednesday': [
        {
          id: 'order-4',
          orderNumber: 'ORD-1234567893-JKL',
          status: 'CONFIRMED',
          total: 67.96,
          createdAt: '2025-08-02T16:45:00Z',
          customerName: 'Emily Davis',
          customerEmail: 'emily@example.com',
          shippingZip: '30236',
          shippingCity: 'Marietta',
          shippingState: 'GA',
          items: [
            { id: 'item-6', quantity: 1, productName: 'Wooden Cutting Board', productImage: null },
            { id: 'item-7', quantity: 2, productName: 'Artisan Soap', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '📦 Standard'
        }
      ],
      'Thursday': [
        {
          id: 'order-5',
          orderNumber: 'ORD-1234567894-MNO',
          status: 'PENDING',
          total: 25.99,
          createdAt: '2025-08-02T18:20:00Z',
          customerName: 'David Brown',
          customerEmail: 'david@example.com',
          shippingZip: '30301',
          shippingCity: 'Atlanta',
          shippingState: 'GA',
          items: [
            { id: 'item-8', quantity: 1, productName: 'Handcrafted Ceramic Mug', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '⚡ Fast Fulfillment'
        }
      ],
      'Friday': [
        {
          id: 'order-6',
          orderNumber: 'ORD-1234567895-PQR',
          status: 'CONFIRMED',
          total: 123.94,
          createdAt: '2025-08-02T20:10:00Z',
          customerName: 'Lisa Anderson',
          customerEmail: 'lisa@example.com',
          shippingZip: '30302',
          shippingCity: 'Atlanta',
          shippingState: 'GA',
          items: [
            { id: 'item-9', quantity: 2, productName: 'Wooden Cutting Board', productImage: null },
            { id: 'item-10', quantity: 3, productName: 'Artisan Soap', productImage: null },
            { id: 'item-11', quantity: 1, productName: 'Handcrafted Ceramic Mug', productImage: null }
          ],
          fulfillmentStatus: 'PENDING',
          etaLabel: '📦 Standard'
        }
      ]
    };

    res.json({
      batches: mockBatches,
      totalOrders: 6,
      totalBatches: 5
    });

  } catch (error) {
    console.error('Error fetching delivery batches:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch delivery batches'
    });
  }
});

export default router; 