import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const GetOrdersQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  q: z.string().optional(),
  view: z.enum(['list', 'board', 'calendar', 'batching']).default('list'),
  page: z.string().transform(val => val ? parseInt(val) : 1),
  pageSize: z.string().transform(val => val ? parseInt(val) : 20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'CANCELLED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RUSH']).default('MEDIUM'),
  source: z.string().optional(),
  salesWindowId: z.string().optional(),
  expectedAt: z.string().optional(),
  dueAt: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  station: z.string().optional(),
  tags: z.array(z.string()).optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    variantName: z.string().optional(),
    qty: z.number().positive(),
    unitPrice: z.number().positive(),
    notes: z.string().optional(),
  })),
});

const UpdateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RUSH']).optional(),
  station: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  expectedAt: z.string().optional(),
  dueAt: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'CANCELLED']),
  station: z.string().optional(),
  notes: z.string().optional(),
});

const BulkStatusSchema = z.object({
  ids: z.array(z.string()),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PICKED_UP', 'CANCELLED']),
  station: z.string().optional(),
});

const UpdateItemStatusSchema = z.object({
  status: z.enum(['QUEUED', 'PREP', 'COOK', 'COOL', 'PACK', 'READY']),
  madeQty: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET /api/vendor/orders
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { status, priority, q, view, page, pageSize, dateFrom, dateTo } = GetOrdersQuerySchema.parse(req.query);

    // Build where clause
    const where: any = { vendorProfileId };
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * pageSize;

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
          salesWindow: {
            select: {
              id: true,
              name: true,
            },
          },
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    // Calculate summary stats
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { vendorProfileId },
      _count: { id: true },
      _sum: { total: true },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.id,
        total: stat._sum.total || 0,
      };
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    res.json({
      orders: orders.map(order => ({
        ...order,
        customFields: order.customFields ? JSON.parse(order.customFields) : null,
        tags: order.tags ? JSON.parse(order.tags) : [],
        orderItems: order.orderItems.map(item => ({
          ...item,
          labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
        })),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: statusCounts,
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/vendor/orders
router.post('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const orderData = CreateOrderSchema.parse(req.body);

    // Generate order number
    const orderCount = await prisma.order.count({ where: { vendorProfileId } });
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        vendorProfileId,
        userId: req.user!.userId, // Link to user for compatibility
        orderNumber,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        phone: orderData.phone,
        status: orderData.status,
        priority: orderData.priority,
        source: orderData.source,
        salesWindowId: orderData.salesWindowId,
        expectedAt: orderData.expectedAt ? new Date(orderData.expectedAt) : null,
        dueAt: orderData.dueAt ? new Date(orderData.dueAt) : null,
        paymentStatus: orderData.paymentStatus,
        notes: orderData.notes,
        customFields: orderData.customFields ? JSON.stringify(orderData.customFields) : null,
        station: orderData.station,
        tags: orderData.tags ? JSON.stringify(orderData.tags) : null,
        subtotal: orderData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0),
        total: orderData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0),
        orderItems: {
          create: orderData.items.map(item => ({
            productId: item.productId,
            vendorProfileId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.qty,
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.qty * item.unitPrice,
            total: item.qty * item.unitPrice,
            notes: item.notes,
          })),
        },
        timeline: {
          create: {
            type: 'created',
            data: JSON.stringify({
              status: orderData.status,
              priority: orderData.priority,
              source: orderData.source,
            }),
          },
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Create system message
    await prisma.systemMessage.create({
      data: {
        vendorProfileId,
        scope: 'orders',
        type: 'order_created',
        title: 'New Order Created',
        body: `Order ${orderNumber} created for ${orderData.customerName}`,
        data: JSON.stringify({ orderId: order.id, orderNumber }),
      },
    });

    res.status(201).json({
      ...order,
      customFields: order.customFields ? JSON.parse(order.customFields) : null,
      tags: order.tags ? JSON.parse(order.tags) : [],
      orderItems: order.orderItems.map(item => ({
        ...item,
        labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
      })),
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/vendor/orders/:id
router.put('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;
    const updateData = UpdateOrderSchema.parse(req.body);

    // Check if order exists and belongs to vendor
    const existingOrder = await prisma.order.findFirst({
      where: { id, vendorProfileId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        customFields: updateData.customFields ? JSON.stringify(updateData.customFields) : undefined,
        tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
        expectedAt: updateData.expectedAt ? new Date(updateData.expectedAt) : undefined,
        dueAt: updateData.dueAt ? new Date(updateData.dueAt) : undefined,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Add timeline entry for significant changes
    if (updateData.status || updateData.priority || updateData.station) {
      await prisma.orderTimeline.create({
        data: {
          orderId: id,
          type: 'status',
          data: JSON.stringify({
            status: updateData.status,
            priority: updateData.priority,
            station: updateData.station,
          }),
        },
      });
    }

    res.json({
      ...order,
      customFields: order.customFields ? JSON.parse(order.customFields) : null,
      tags: order.tags ? JSON.parse(order.tags) : [],
      orderItems: order.orderItems.map(item => ({
        ...item,
        labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
      })),
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// POST /api/vendor/orders/:id/status
router.post('/:id/status', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;
    const { status, station, notes } = UpdateStatusSchema.parse(req.body);

    // Check if order exists and belongs to vendor
    const existingOrder = await prisma.order.findFirst({
      where: { id, vendorProfileId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        station,
        notes: notes || existingOrder.notes,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        salesWindow: {
          select: {
            id: true,
            name: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: id,
        type: 'status',
        data: JSON.stringify({
          status,
          station,
          notes,
          previousStatus: existingOrder.status,
        }),
      },
    });

    // Create system message for status changes
    if (status !== existingOrder.status) {
      await prisma.systemMessage.create({
        data: {
          vendorProfileId,
          scope: 'orders',
          type: 'status_change',
          title: `Order ${order.orderNumber} Status Updated`,
          body: `Status changed from ${existingOrder.status} to ${status}`,
          data: JSON.stringify({ orderId: id, orderNumber: order.orderNumber, status, previousStatus: existingOrder.status }),
        },
      });
    }

    res.json({
      ...order,
      customFields: order.customFields ? JSON.parse(order.customFields) : null,
      tags: order.tags ? JSON.parse(order.tags) : [],
      orderItems: order.orderItems.map(item => ({
        ...item,
        labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
      })),
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /api/vendor/orders/:id/item/:itemId/status
router.post('/:id/item/:itemId/status', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id, itemId } = req.params;
    const { status, madeQty, notes } = UpdateItemStatusSchema.parse(req.body);

    // Check if order exists and belongs to vendor
    const order = await prisma.order.findFirst({
      where: { id, vendorProfileId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order item status
    const orderItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status,
        madeQty: madeQty !== undefined ? madeQty : undefined,
        notes: notes || undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: id,
        type: 'status',
        data: JSON.stringify({
          itemId,
          itemStatus: status,
          madeQty,
          notes,
          productName: orderItem.productName,
        }),
      },
    });

    res.json({
      ...orderItem,
      labelsJson: orderItem.labelsJson ? JSON.parse(orderItem.labelsJson) : null,
    });

  } catch (error) {
    console.error('Update order item status error:', error);
    res.status(500).json({ error: 'Failed to update order item status' });
  }
});

// POST /api/vendor/orders/bulk-status
router.post('/bulk-status', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { ids, status, station } = BulkStatusSchema.parse(req.body);

    // Update multiple orders
    const result = await prisma.order.updateMany({
      where: {
        id: { in: ids },
        vendorProfileId,
      },
      data: {
        status,
        station,
      },
    });

    // Add timeline entries for each order
    const timelineEntries = ids.map(orderId => ({
      orderId,
      type: 'status',
      data: JSON.stringify({ status, station, bulkUpdate: true }),
    }));

    await prisma.orderTimeline.createMany({
      data: timelineEntries,
    });

    // Create system message
    await prisma.systemMessage.create({
      data: {
        vendorProfileId,
        scope: 'orders',
        type: 'bulk_status_change',
        title: 'Bulk Status Update',
        body: `Updated ${result.count} orders to ${status}`,
        data: JSON.stringify({ orderIds: ids, status, station }),
      },
    });

    res.json({
      success: true,
      updatedCount: result.count,
      orderIds: ids,
    });

  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({ error: 'Failed to update orders status' });
  }
});

// GET /api/vendor/orders/:id/timeline
router.get('/:id/timeline', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;

    // Check if order exists and belongs to vendor
    const order = await prisma.order.findFirst({
      where: { id, vendorProfileId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get timeline
    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      timeline: timeline.map(entry => ({
        ...entry,
        data: entry.data ? JSON.parse(entry.data) : null,
      })),
    });

  } catch (error) {
    console.error('Get order timeline error:', error);
    res.status(500).json({ error: 'Failed to get order timeline' });
  }
});

export default router;
