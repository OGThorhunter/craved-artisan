import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/orders/history
 * Fetch order history for the authenticated customer
 */
router.get('/history', async (req, res) => {
  try {
    // Check authentication
    if (!req.session?.user?.userId) {
      logger.warn('Unauthorized access attempt to order history');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in'
      });
    }

    const userId = req.session.user.userId;
    logger.info({ userId }, 'Fetching order history for customer');

    // Fetch orders for this customer
    const orders = await prisma.order.findMany({
      where: {
        customerId: userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true
              }
            }
          }
        },
        fulfillment: {
          select: {
            id: true,
            status: true,
            type: true,
            trackingNumber: true,
            carrier: true,
            estimatedDelivery: true,
            actualDelivery: true
          }
        },
        shippingAddress: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            address1: true,
            address2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to most recent 50 orders
    });

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          price: item.product.price
        }
      })),
      fulfillment: order.fulfillment,
      shippingAddress: order.shippingAddress
    }));

    logger.info({ userId, orderCount: formattedOrders.length }, 'Order history fetched successfully');

    res.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching order history');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order history'
    });
  }
});

/**
 * GET /api/orders/:id/receipt
 * Get receipt/invoice for a specific order
 */
router.get('/:id/receipt', async (req, res) => {
  try {
    if (!req.session?.user?.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const orderId = req.params.id;
    const userId = req.session.user.userId;

    // Fetch order with full details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId // Ensure customer owns this order
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        fulfillment: true,
        shippingAddress: true
      }
    });

    if (!order) {
      logger.warn({ orderId, userId }, 'Order not found or unauthorized');
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // In a real implementation, generate a PDF receipt here
    // For now, return the order data
    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        items: order.items,
        fulfillment: order.fulfillment,
        shippingAddress: order.shippingAddress
      }
    });

  } catch (error) {
    logger.error({ error }, 'Error fetching order receipt');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order receipt'
    });
  }
});

export default router;

