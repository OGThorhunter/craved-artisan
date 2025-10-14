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

// Order modification endpoints
const OrderModificationSchema = z.object({
  orderId: z.string(),
  originalSubtotal: z.number(),
  originalTax: z.number(),
  originalShipping: z.number(),
  originalTotal: z.number(),
  newSubtotal: z.number(),
  newTax: z.number(),
  newShipping: z.number(),
  newTotal: z.number(),
  paymentAdjustment: z.number(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    orderItemId: z.string().optional(),
    productId: z.string(),
    productName: z.string(),
    action: z.enum(['ADD', 'REMOVE', 'UPDATE_QUANTITY', 'UPDATE_PRICE']),
    originalQuantity: z.number().optional(),
    newQuantity: z.number().optional(),
    originalPrice: z.number().optional(),
    newPrice: z.number().optional(),
    priceImpact: z.number(),
    notes: z.string().optional(),
  })),
});

// POST /api/orders/:id/modify - Create order modification
router.post('/:id/modify', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorProfileId = req.vendorProfileId;
    const userId = req.userId;
    
    // Validate request body
    const validatedData = OrderModificationSchema.parse(req.body);
    
    // Verify order exists and belongs to vendor
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorProfileId: vendorProfileId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create the order modification record
    const modification = await prisma.orderModification.create({
      data: {
        orderId: orderId,
        originalSubtotal: validatedData.originalSubtotal,
        originalTax: validatedData.originalTax,
        originalShipping: validatedData.originalShipping,
        originalTotal: validatedData.originalTotal,
        newSubtotal: validatedData.newSubtotal,
        newTax: validatedData.newTax,
        newShipping: validatedData.newShipping,
        newTotal: validatedData.newTotal,
        paymentAdjustment: validatedData.paymentAdjustment,
        status: 'PENDING',
        reason: validatedData.reason,
        notes: validatedData.notes,
        createdBy: userId,
        items: {
          create: validatedData.items.map(item => ({
            orderItemId: item.orderItemId,
            productId: item.productId,
            productName: item.productName,
            action: item.action,
            originalQuantity: item.originalQuantity,
            newQuantity: item.newQuantity,
            originalPrice: item.originalPrice,
            newPrice: item.newPrice,
            priceImpact: item.priceImpact,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Apply modifications to the order and update inventory
    const updatedOrderItems = [];
    const inventoryUpdates = [];
    
    for (const modItem of validatedData.items) {
      if (modItem.action === 'ADD') {
        // Add new item
        const newOrderItem = await prisma.orderItem.create({
          data: {
            orderId: orderId,
            productId: modItem.productId,
            vendorProfileId: vendorProfileId,
            productName: modItem.productName,
            quantity: modItem.newQuantity || 0,
            unitPrice: modItem.newPrice || 0,
            total: (modItem.newQuantity || 0) * (modItem.newPrice || 0),
            status: 'QUEUED',
            madeQty: 0,
          },
        });
        updatedOrderItems.push(newOrderItem);
        
        // Reserve inventory for new item
        inventoryUpdates.push({
          productId: modItem.productId,
          quantityChange: -(modItem.newQuantity || 0), // Negative = reserve
          action: 'RESERVE',
          reason: `Order modification - added item to order ${order.orderNumber}`,
        });
        
      } else if (modItem.action === 'REMOVE' && modItem.orderItemId) {
        // Get original item before deletion for inventory update
        const originalItem = await prisma.orderItem.findUnique({
          where: { id: modItem.orderItemId },
        });
        
        // Remove item
        await prisma.orderItem.delete({
          where: { id: modItem.orderItemId },
        });
        
        // Release inventory for removed item
        if (originalItem) {
          inventoryUpdates.push({
            productId: originalItem.productId,
            quantityChange: originalItem.quantity, // Positive = release
            action: 'RELEASE',
            reason: `Order modification - removed item from order ${order.orderNumber}`,
          });
        }
        
      } else if (modItem.action === 'UPDATE_QUANTITY' && modItem.orderItemId) {
        // Update quantity
        const updatedItem = await prisma.orderItem.update({
          where: { id: modItem.orderItemId },
          data: {
            quantity: modItem.newQuantity || 0,
            total: (modItem.newQuantity || 0) * (modItem.originalPrice || 0),
          },
        });
        updatedOrderItems.push(updatedItem);
        
        // Adjust inventory reservation
        const quantityDiff = (modItem.newQuantity || 0) - (modItem.originalQuantity || 0);
        if (quantityDiff !== 0) {
          inventoryUpdates.push({
            productId: modItem.productId,
            quantityChange: -quantityDiff, // Negative = reserve more, Positive = release
            action: quantityDiff > 0 ? 'RESERVE' : 'RELEASE',
            reason: `Order modification - quantity changed for order ${order.orderNumber}`,
          });
        }
        
      } else if (modItem.action === 'UPDATE_PRICE' && modItem.orderItemId) {
        // Update price (no inventory impact)
        const updatedItem = await prisma.orderItem.update({
          where: { id: modItem.orderItemId },
          data: {
            unitPrice: modItem.newPrice || 0,
            total: (modItem.originalQuantity || 0) * (modItem.newPrice || 0),
          },
        });
        updatedOrderItems.push(updatedItem);
      }
    }

    // Process inventory updates
    for (const invUpdate of inventoryUpdates) {
      try {
        // Check if inventory item exists
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: invUpdate.productId,
            vendorProfileId: vendorProfileId,
          },
        });

        if (inventoryItem) {
          // Update existing inventory
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              reservedQty: {
                increment: invUpdate.action === 'RESERVE' ? Math.abs(invUpdate.quantityChange) : -Math.abs(invUpdate.quantityChange),
              },
            },
          });

          // Create inventory movement record
          await prisma.inventoryMovement.create({
            data: {
              inventoryItemId: inventoryItem.id,
              type: invUpdate.action === 'RESERVE' ? 'RESERVED' : 'RELEASED',
              quantity: Math.abs(invUpdate.quantityChange),
              reason: invUpdate.reason,
              referenceId: orderId,
              referenceType: 'ORDER_MODIFICATION',
            },
          });
        } else {
          // Create new inventory item if it doesn't exist
          const newInventoryItem = await prisma.inventoryItem.create({
            data: {
              vendorProfileId: vendorProfileId,
              productId: invUpdate.productId,
              currentQty: 0,
              reservedQty: invUpdate.action === 'RESERVE' ? Math.abs(invUpdate.quantityChange) : 0,
              reorderPoint: 0,
              maxQty: 1000, // Default max
            },
          });

          // Create inventory movement record
          await prisma.inventoryMovement.create({
            data: {
              inventoryItemId: newInventoryItem.id,
              type: invUpdate.action === 'RESERVE' ? 'RESERVED' : 'RELEASED',
              quantity: Math.abs(invUpdate.quantityChange),
              reason: invUpdate.reason,
              referenceId: orderId,
              referenceType: 'ORDER_MODIFICATION',
            },
          });
        }
      } catch (inventoryError) {
        console.warn('Inventory update failed:', inventoryError);
        // Continue with order modification even if inventory update fails
      }
    }

    // Update order totals
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        subtotal: validatedData.newSubtotal,
        tax: validatedData.newTax,
        shipping: validatedData.newShipping,
        total: validatedData.newTotal,
      },
      include: {
        orderItems: true,
      },
    });

    // Mark modification as completed
    await prisma.orderModification.update({
      where: { id: modification.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Process payment adjustment with Stripe
    let paymentResult = null;
    if (Math.abs(validatedData.paymentAdjustment) >= 0.50) { // Minimum amount for Stripe processing
      try {
        paymentResult = await processStripePaymentAdjustment({
          orderId: orderId,
          paymentIntentId: order.paymentIntentId,
          adjustmentAmount: validatedData.paymentAdjustment,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail || updatedOrder.user?.email,
        });
      } catch (paymentError) {
        console.warn('Payment processing failed:', paymentError);
        // Continue with order modification but flag payment as failed
        await prisma.orderModification.update({
          where: { id: modification.id },
          data: {
            status: 'COMPLETED',
            notes: `${modification.notes || ''}\n\nPayment processing failed: ${paymentError.message}`,
          },
        });
      }
    }

    // Send email notification to customer
    try {
      await sendOrderModificationEmail({
        customerEmail: order.customerEmail || updatedOrder.user?.email,
        customerName: order.customerName || updatedOrder.user?.name,
        orderNumber: order.orderNumber,
        modification: modification,
        updatedOrder: updatedOrder,
        paymentAdjustment: validatedData.paymentAdjustment,
        paymentResult: paymentResult,
      });
    } catch (emailError) {
      console.warn('Failed to send email notification:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      modification: modification,
      updatedOrder: updatedOrder,
    });
  } catch (error) {
    console.error('Order modification error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to modify order' });
  }
});

// GET /api/orders/:id/modifications - Get order modification history
router.get('/:id/modifications', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorProfileId = req.vendorProfileId;
    
    // Verify order exists and belongs to vendor
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorProfileId: vendorProfileId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const modifications = await prisma.orderModification.findMany({
      where: { orderId: orderId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(modifications);
  } catch (error) {
    console.error('Get order modifications error:', error);
    res.status(500).json({ error: 'Failed to get order modifications' });
  }
});

// POST /api/orders/:id/calculate-adjustment - Preview order changes
router.post('/:id/calculate-adjustment', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const vendorProfileId = req.vendorProfileId;
    
    // Validate request body (same schema as modify)
    const validatedData = OrderModificationSchema.parse(req.body);
    
    // Verify order exists and belongs to vendor
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        vendorProfileId: vendorProfileId,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Calculate the preview without saving
    const preview = {
      originalTotals: {
        subtotal: validatedData.originalSubtotal,
        tax: validatedData.originalTax,
        shipping: validatedData.originalShipping,
        total: validatedData.originalTotal,
      },
      newTotals: {
        subtotal: validatedData.newSubtotal,
        tax: validatedData.newTax,
        shipping: validatedData.newShipping,
        total: validatedData.newTotal,
      },
      paymentAdjustment: validatedData.paymentAdjustment,
      adjustmentType: validatedData.paymentAdjustment > 0 ? 'charge' : 'refund',
      itemChanges: validatedData.items.length,
    };

    res.json(preview);
  } catch (error) {
    console.error('Calculate adjustment error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to calculate adjustment' });
  }
});

// Stripe payment processing service
async function processStripePaymentAdjustment(params: {
  orderId: string;
  paymentIntentId?: string;
  adjustmentAmount: number;
  orderNumber: string;
  customerEmail?: string;
}) {
  const { orderId, paymentIntentId, adjustmentAmount, orderNumber, customerEmail } = params;
  
  // Mock Stripe integration - in a real implementation, you would:
  // 1. Import Stripe SDK
  // 2. Initialize with secret key
  // 3. Process actual refunds/charges
  
  console.log('Processing Stripe payment adjustment:', {
    orderId,
    paymentIntentId,
    adjustmentAmount,
    orderNumber,
    customerEmail,
  });

  if (adjustmentAmount > 0) {
    // Additional charge needed
    console.log(`Creating additional charge of $${adjustmentAmount.toFixed(2)} for order ${orderNumber}`);
    
    // In real implementation:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(adjustmentAmount * 100), // Convert to cents
    //   currency: 'usd',
    //   customer: customerId,
    //   metadata: {
    //     orderId: orderId,
    //     type: 'order_modification_charge'
    //   }
    // });
    
    return {
      type: 'charge',
      amount: adjustmentAmount,
      status: 'succeeded', // Mock success
      paymentIntentId: `pi_mock_${Date.now()}`,
      message: `Additional charge of $${adjustmentAmount.toFixed(2)} processed successfully`,
    };
    
  } else if (adjustmentAmount < 0) {
    // Refund needed
    const refundAmount = Math.abs(adjustmentAmount);
    console.log(`Processing refund of $${refundAmount.toFixed(2)} for order ${orderNumber}`);
    
    // In real implementation:
    // const refund = await stripe.refunds.create({
    //   payment_intent: paymentIntentId,
    //   amount: Math.round(refundAmount * 100), // Convert to cents
    //   metadata: {
    //     orderId: orderId,
    //     type: 'order_modification_refund'
    //   }
    // });
    
    return {
      type: 'refund',
      amount: refundAmount,
      status: 'succeeded', // Mock success
      refundId: `re_mock_${Date.now()}`,
      message: `Refund of $${refundAmount.toFixed(2)} processed successfully`,
    };
  }
  
  return null; // No payment adjustment needed
}

// Email notification service
async function sendOrderModificationEmail(params: {
  customerEmail?: string;
  customerName?: string;
  orderNumber: string;
  modification: any;
  updatedOrder: any;
  paymentAdjustment: number;
  paymentResult?: any;
}) {
  const { customerEmail, customerName, orderNumber, modification, updatedOrder, paymentAdjustment, paymentResult } = params;
  
  if (!customerEmail) {
    console.warn('No customer email provided for order modification notification');
    return;
  }

  // Simple email template
  const emailSubject = `Order ${orderNumber} has been updated`;
  const emailBody = `
    Dear ${customerName || 'Customer'},

    Your order ${orderNumber} has been modified. Here are the details:

    ${paymentAdjustment > 0 
      ? `Additional charge: $${paymentAdjustment.toFixed(2)}${paymentResult ? ` (${paymentResult.message})` : ''}`
      : paymentAdjustment < 0
      ? `Refund amount: $${Math.abs(paymentAdjustment).toFixed(2)}${paymentResult ? ` (${paymentResult.message})` : ''}`
      : 'No payment adjustment required'
    }

    Original Total: $${modification.originalTotal.toFixed(2)}
    New Total: $${modification.newTotal.toFixed(2)}

    Item Changes:
    ${modification.items.map((item: any) => {
      if (item.action === 'ADD') return `+ Added: ${item.productName} (${item.newQuantity})`;
      if (item.action === 'REMOVE') return `- Removed: ${item.productName}`;
      if (item.action === 'UPDATE_QUANTITY') return `• ${item.productName}: ${item.originalQuantity} → ${item.newQuantity}`;
      if (item.action === 'UPDATE_PRICE') return `• ${item.productName}: $${item.originalPrice?.toFixed(2)} → $${item.newPrice?.toFixed(2)}`;
      return '';
    }).filter(Boolean).join('\n    ')}

    ${modification.reason ? `Reason: ${modification.reason}` : ''}

    If you have any questions about these changes, please contact us.

    Thank you for your business!
  `;

  // In a real implementation, you would use a proper email service like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  // - Resend
  
  console.log('Email notification (mock):', {
    to: customerEmail,
    subject: emailSubject,
    body: emailBody.trim(),
  });

  // Mock successful email send
  return Promise.resolve();
}

export default router;
