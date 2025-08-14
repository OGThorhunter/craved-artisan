import express from 'express';
import { z } from 'zod';
import prisma, { OrderStatus } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const updateFulfillmentSchema = z.object({
  status: z.enum([OrderStatus.PENDING, 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  notes: z.string().optional()
});

// GET /api/vendor/orders - Get all orders for vendor's products
router.get('/', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Get vendor's profile ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: req.session.userId }
    });

    if (!vendorProfile) {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please complete your vendor profile setup'
      });
    }

    // Get all orders that contain products from this vendor
    const orders = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                vendorProfileId: true
              }
            }
          }
        },
        fulfillments: true,
        shippingAddress: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter order items to only include vendor's products and group by order
    const vendorOrders = orders.map(order => {
      const vendorOrderItems = order.orderItems.filter(
        (item: any) => item.product.vendorProfileId === vendorProfile.id
      );

      const vendorSubtotal = vendorOrderItems.reduce(
        (sum: number, item: any) => sum + Number(item.total), 0
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: vendorSubtotal,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: {
          id: order.user.id,
          name: `${order.user.name?.split(" ")[0] || ""} ${order.user.name?.split(" ")[1] || ""}`,
          email: order.user.email
        },
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          address1: order.shippingAddress.address1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode
        } : undefined,
        items: vendorOrderItems.map((item: any) => ({
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
          carrier: order.fulfillments[0].carrier,
          estimatedDelivery: order.fulfillments[0].estimatedDelivery,
          actualDelivery: order.fulfillments[0].actualDelivery,
          notes: order.fulfillments[0].notes,
          etaLabel: order.fulfillments[0].etaLabel,
          predictedHours: order.fulfillments[0].predictedHours
        } : undefined
      };
    });

    return res.json({
      orders: vendorOrders
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/vendor/orders/:id - Get specific order details
router.get('/:id', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get vendor's profile ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: req.session.userId }
    });

    if (!vendorProfile) {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please complete your vendor profile setup'
      });
    }

    // Get order with vendor's products only
    const order = await prisma.order.findFirst({
      where: {
        id,
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                vendorProfileId: true
              }
            }
          }
        },
        fulfillments: true,
        shippingAddress: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist or does not contain your products'
      });
    }

    // Filter to vendor's products only
    const vendorOrderItems = order.orderItems.filter(
      (item: any) => item.product.vendorProfileId === vendorProfile.id
    );

    const vendorSubtotal = vendorOrderItems.reduce(
      (sum: number, item: any) => sum + Number(item.total), 0
    );

    return res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: vendorSubtotal,
        total: order.total,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: {
          id: order.user.id,
          name: order.user.name || 'Unknown',
          email: order.user.email
        },
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
        } : undefined,
        items: vendorOrderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.imageUrl
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
          notes: order.fulfillments[0].notes,
          etaLabel: order.fulfillments[0].etaLabel,
          predictedHours: order.fulfillments[0].predictedHours
        } : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching vendor order:', error);
    return res.status(400).json({
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
        details: validationResult.errors
      });
    }

    const { status, trackingNumber, carrier, estimatedDelivery, notes } = validationResult.data;

    // Get vendor's profile ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: req.session.userId }
    });

    if (!vendorProfile) {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please complete your vendor profile setup'
      });
    }

    // Verify order contains vendor's products
    const order = await prisma.order.findFirst({
      where: {
        id,
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        }
      },
      include: {
        fulfillments: true
      }
    });

    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
        message: 'Order does not exist or does not contain your products'
      });
    }

    // Update fulfillment
    const fulfillment = order.fulfillments[0];
    if (!fulfillment) {
      return res.status(400).json({
        error: 'Fulfillment not found',
        message: 'No fulfillment record found for this order'
      });
    }

    const updatedFulfillment = await prisma.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        status,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        notes: notes || null,
        actualDelivery: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    // Update order status if fulfillment is completed
    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CONFIRMED,
          deliveredAt: new Date()
        }
      });
    }

    return res.json({
      message: 'Fulfillment updated successfully',
      fulfillment: {
        id: updatedFulfillment.id,
        status: updatedFulfillment.status,
        type: updatedFulfillment.fulfillmentType,
        trackingNumber: updatedFulfillment.trackingNumber,
        carrier: updatedFulfillment.carrier,
        estimatedDelivery: updatedFulfillment.estimatedDelivery,
        actualDelivery: updatedFulfillment.actualDelivery,
        notes: updatedFulfillment.notes
      }
    });
  } catch (error) {
    console.error('Error updating fulfillment:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to update fulfillment'
    });
  }
});

// GET /api/vendor/orders/stats - Get order statistics
router.get('/stats', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    // Get vendor's profile ID
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: req.session.userId }
    });

    if (!vendorProfile) {
      return res.status(400).json({
        error: 'Vendor profile not found',
        message: 'Please complete your vendor profile setup'
      });
    }

    // Get order statistics
    const totalOrders = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        }
      }
    });

    const pendingOrders = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        },
        fulfillments: {
          some: {
            status: OrderStatus.PENDING
          }
        }
      }
    });

    const inProgressOrders = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        },
        fulfillments: {
          some: {
            status: 'IN_PROGRESS'
          }
        }
      }
    });

    const completedOrders = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: {
              vendorProfileId: vendorProfile.id
            }
          }
        },
        fulfillments: {
          some: {
            status: 'COMPLETED'
          }
        }
      }
    });

    // Calculate total revenue
    const revenueData = await prisma.orderItem.aggregate({
      where: {
        product: {
          vendorProfileId: vendorProfile.id
        }
      },
      _sum: {
        total: true
      }
    });

    const totalRevenue = revenueData._sum.total || 0;

    return res.json({
      stats: {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        totalRevenue: Number(totalRevenue)
      }
    });
  } catch (error) {
    console.error('Error fetching vendor order stats:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch order statistics'
    });
  }
});

// GET /api/vendor/orders/delivery-batches - Get orders grouped by delivery day
router.get('/delivery-batches', requireAuth, requireRole(['VENDOR']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PENDING, 'CONFIRMED'] },
        deliveryDay: { not: undefined }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        },
        shippingAddress: {
          select: {
            name: true,
            city: true,
            state: true
          }
        },
        fulfillments: {
          select: {
            status: true,
            etaLabel: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group orders by delivery day
    const batchedOrders: Record<string, any[]> = {};
    
    orders.forEach(order => {
      const day = order.deliveryDay || 'Unassigned';
      if (!batchedOrders[day]) {
        batchedOrders[day] = [];
      }
      
      batchedOrders[day].push({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        customerName: order.user?.name || order.user?.email || 'Unknown',
        customerEmail: order.user?.email,
        shippingZip: order.shippingZip,
        shippingCity: order.shippingAddress?.city,
        shippingState: order.shippingAddress?.state,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          productName: item.product.name,
          productImage: item.product.imageUrl
        })),
        fulfillmentStatus: order.fulfillments[0]?.status || OrderStatus.PENDING,
        etaLabel: order.fulfillments[0]?.etaLabel
      });
    });

    // Sort days in logical order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Unassigned'];
    const sortedBatches: Record<string, any[]> = {};
    
    dayOrder.forEach(day => {
      if (batchedOrders[day]) {
        sortedBatches[day] = batchedOrders[day];
      }
    });

    return res.json({
      batches: sortedBatches,
      totalOrders: orders.length,
      totalBatches: Object.keys(sortedBatches).length
    });

  } catch (error) {
    console.error('Error fetching delivery batches:', error);
    return res.status(400).json({
      error: 'Internal server error',
      message: 'Failed to fetch delivery batches'
    });
  }
});

export default router; 