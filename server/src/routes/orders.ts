import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

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

    // Validate that user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    // Get or create shipping address
    let finalShippingAddressId = shippingAddressId;
    if (!finalShippingAddressId) {
      // Get default shipping address or create one
      const defaultAddress = user.addresses.find(addr => addr.isDefault && addr.type === 'SHIPPING');
      if (!defaultAddress) {
        return res.status(400).json({
          error: 'Shipping address required',
          message: 'Please provide a shipping address or set a default address'
        });
      }
      finalShippingAddressId = defaultAddress.id;
    }

    // Validate all products exist and are available
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true
      }
    });

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

    // Validate price consistency (prevent price manipulation)
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

    // Create order with transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          shipping: calculatedShipping,
          total: calculatedTotal,
          notes,
          userId,
          shippingAddressId: finalShippingAddressId
        }
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map(item =>
          tx.orderItem.create({
            data: {
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              orderId: newOrder.id,
              productId: item.productId
            }
          })
        )
      );

      // Update product stock levels
      await Promise.all(
        items.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      // Create fulfillment record
      const fulfillment = await tx.fulfillment.create({
        data: {
          fulfillmentType: 'SHIPPING',
          status: 'PENDING',
          orderId: newOrder.id
        }
      });

      return {
        order: newOrder,
        orderItems,
        fulfillment
      };
    });

    // Return success response
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.order.id,
        orderNumber: order.order.orderNumber,
        status: order.order.status,
        total: order.order.total,
        createdAt: order.order.createdAt
      },
      items: order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      fulfillment: {
        id: order.fulfillment.id,
        status: order.fulfillment.status,
        type: order.fulfillment.fulfillmentType
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
    const orders = await prisma.order.findMany({
      where: {
        userId: req.session.userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        fulfillments: true,
        shippingAddress: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.product.id,
            name: item.product.name,
            imageUrl: item.product.imageUrl
          }
        })),
        fulfillment: order.fulfillments[0] ? {
          id: order.fulfillments[0].id,
          status: order.fulfillments[0].status,
          type: order.fulfillments[0].fulfillmentType,
          trackingNumber: order.fulfillments[0].trackingNumber,
          estimatedDelivery: order.fulfillments[0].estimatedDelivery
        } : null,
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          address1: order.shippingAddress.address1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode
        } : null
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

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.session.userId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        fulfillments: true,
        shippingAddress: true
      }
    });

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
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
            price: item.product.price
          }
        })),
        fulfillment: order.fulfillments[0] ? {
          id: order.fulfillments[0].id,
          status: order.fulfillments[0].status,
          type: order.fulfillments[0].fulfillmentType,
          trackingNumber: order.fulfillments[0].trackingNumber,
          carrier: order.fulfillments[0].carrier,
          estimatedDelivery: order.fulfillments[0].estimatedDelivery,
          actualDelivery: order.fulfillments[0].actualDelivery,
          notes: order.fulfillments[0].notes
        } : null,
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          company: order.shippingAddress.company,
          address1: order.shippingAddress.address1,
          address2: order.shippingAddress.address2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone
        } : null
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