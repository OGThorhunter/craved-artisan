import express from 'express';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Validation schemas
const BoardQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const CalendarQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
});

const BatchingQuerySchema = z.object({
  range: z.string().default('7d'),
  filter: z.string().optional(),
});

// GET /api/vendor/orders/board
router.get('/board', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { dateFrom, dateTo } = BoardQuerySchema.parse(req.query);

    // Build where clause
    const where: any = { vendorProfileId };
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get orders grouped by status
    const orders = await prisma.order.findMany({
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
      },
      orderBy: [
        { priority: 'desc' },
        { dueAt: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Group orders by status
    const statusGroups = {
      PENDING: [],
      CONFIRMED: [],
      IN_PRODUCTION: [],
      READY: [],
      OUT_FOR_DELIVERY: [],
      DELIVERED: [],
      PICKED_UP: [],
      CANCELLED: [],
    };

    orders.forEach(order => {
      const orderData = {
        ...order,
        customFields: order.customFields ? JSON.parse(order.customFields) : null,
        tags: order.tags ? JSON.parse(order.tags) : [],
        orderItems: order.orderItems.map(item => ({
          ...item,
          labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
        })),
        // Calculate summary stats
        totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: order.total,
        isOverdue: order.dueAt && new Date() > new Date(order.dueAt) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status),
        isDueSoon: order.dueAt && new Date(order.dueAt) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status),
      };
      
      if (statusGroups[order.status as keyof typeof statusGroups]) {
        statusGroups[order.status as keyof typeof statusGroups].push(orderData);
      }
    });

    // Calculate lane totals
    const laneTotals = Object.entries(statusGroups).map(([status, orders]) => ({
      status,
      count: orders.length,
      totalItems: orders.reduce((sum, order) => sum + order.totalItems, 0),
      totalValue: orders.reduce((sum, order) => sum + order.totalValue, 0),
      overdueCount: orders.filter(order => order.isOverdue).length,
      dueSoonCount: orders.filter(order => order.isDueSoon).length,
    }));

    res.json({
      lanes: statusGroups,
      totals: laneTotals,
      summary: {
        totalOrders: orders.length,
        totalValue: orders.reduce((sum, order) => sum + order.total, 0),
        overdueCount: orders.filter(order => order.dueAt && new Date() > new Date(order.dueAt) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status)).length,
        dueSoonCount: orders.filter(order => order.dueAt && new Date(order.dueAt) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status)).length,
      },
    });

  } catch (error) {
    console.error('Get orders board error:', error);
    res.status(500).json({ error: 'Failed to fetch orders board' });
  }
});

// GET /api/vendor/orders/calendar
router.get('/calendar', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { from, to } = CalendarQuerySchema.parse(req.query);

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        vendorProfileId,
        OR: [
          { dueAt: { gte: fromDate, lte: toDate } },
          { expectedAt: { gte: fromDate, lte: toDate } },
        ],
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
      },
      orderBy: { dueAt: 'asc' },
    });

    // Group orders by date
    const calendarData: Record<string, any[]> = {};
    
    orders.forEach(order => {
      const dateKey = order.dueAt ? order.dueAt.toISOString().split('T')[0] : order.expectedAt?.toISOString().split('T')[0];
      
      if (dateKey) {
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = [];
        }
        
        calendarData[dateKey].push({
          ...order,
          customFields: order.customFields ? JSON.parse(order.customFields) : null,
          tags: order.tags ? JSON.parse(order.tags) : [],
          orderItems: order.orderItems.map(item => ({
            ...item,
            labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
          })),
          // Calendar-specific fields
          displayTime: order.dueAt || order.expectedAt,
          isOverdue: order.dueAt && new Date() > new Date(order.dueAt) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status),
          isDueSoon: order.dueAt && new Date(order.dueAt) <= new Date(Date.now() + 2 * 60 * 60 * 1000) && !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status),
        });
      }
    });

    // Sort orders within each date
    Object.keys(calendarData).forEach(date => {
      calendarData[date].sort((a, b) => {
        // Sort by priority first, then by time
        const priorityOrder = { RUSH: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return new Date(a.displayTime).getTime() - new Date(b.displayTime).getTime();
      });
    });

    res.json({
      calendar: calendarData,
      summary: {
        totalOrders: orders.length,
        dateRange: { from, to },
        statusCounts: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });

  } catch (error) {
    console.error('Get orders calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch orders calendar' });
  }
});

// GET /api/vendor/orders/batching
router.get('/batching', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { range, filter } = BatchingQuerySchema.parse(req.query);

    // Calculate date range
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 7;
    const startDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() + (days + 7) * 24 * 60 * 60 * 1000);

    // Get orders within date range
    const orders = await prisma.order.findMany({
      where: {
        vendorProfileId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'] },
        dueAt: { gte: startDate, lte: endDate },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                materials: {
                  include: {
                    inventoryItem: {
                      select: {
                        id: true,
                        name: true,
                        unit: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group items by product
    const productGroups: Record<string, any> = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = `${item.productId}-${item.variantName || 'default'}`;
        
        if (!productGroups[key]) {
          productGroups[key] = {
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName,
            imageUrl: item.product.imageUrl,
            totalQty: 0,
            orders: [],
            materials: item.product.materials || [],
            optimalBatchSize: 12, // Default batch size, could be configurable
          };
        }
        
        productGroups[key].totalQty += item.quantity;
        productGroups[key].orders.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          qty: item.quantity,
          dueAt: order.dueAt,
          priority: order.priority,
          status: order.status,
        });
      });
    });

    // Calculate optimal batches for each product
    const batchingData = Object.values(productGroups).map((product: any) => {
      const batches = [];
      let remainingQty = product.totalQty;
      let batchNumber = 1;
      
      while (remainingQty > 0) {
        const batchQty = Math.min(remainingQty, product.optimalBatchSize);
        const batchStartTime = new Date(Date.now() + (batchNumber - 1) * 2 * 60 * 60 * 1000); // 2 hours between batches
        
        batches.push({
          batchNumber,
          qty: batchQty,
          startAt: batchStartTime,
          station: 'PREP', // Default station
          estimatedDuration: Math.ceil(batchQty / product.optimalBatchSize) * 60, // minutes
        });
        
        remainingQty -= batchQty;
        batchNumber++;
      }
      
      return {
        ...product,
        batches,
        totalBatches: batches.length,
        estimatedTotalTime: batches.reduce((sum, batch) => sum + batch.estimatedDuration, 0),
      };
    });

    // Filter if specified
    let filteredData = batchingData;
    if (filter) {
      filteredData = batchingData.filter((product: any) =>
        product.productName.toLowerCase().includes(filter.toLowerCase()) ||
        product.variantName?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Sort by total quantity (descending)
    filteredData.sort((a: any, b: any) => b.totalQty - a.totalQty);

    res.json({
      products: filteredData,
      summary: {
        totalProducts: filteredData.length,
        totalItems: filteredData.reduce((sum: number, product: any) => sum + product.totalQty, 0),
        totalBatches: filteredData.reduce((sum: number, product: any) => sum + product.totalBatches, 0),
        estimatedTotalTime: filteredData.reduce((sum: number, product: any) => sum + product.estimatedTotalTime, 0),
        dateRange: { start: startDate, end: endDate },
      },
    });

  } catch (error) {
    console.error('Get orders batching error:', error);
    res.status(500).json({ error: 'Failed to fetch orders batching' });
  }
});

// GET /api/vendor/orders/kds
router.get('/kds', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;

    // Get active orders for KDS
    const orders = await prisma.order.findMany({
      where: {
        vendorProfileId,
        status: { in: ['CONFIRMED', 'IN_PRODUCTION'] },
      },
      include: {
        orderItems: {
          where: {
            status: { in: ['QUEUED', 'PREP', 'COOK', 'COOL', 'PACK'] },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                allergenFlags: true,
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
      },
      orderBy: [
        { priority: 'desc' },
        { dueAt: 'asc' },
      ],
    });

    // Group by station
    const stationGroups = {
      PREP: [],
      BAKE: [],
      PACK: [],
      DELIVER: [],
    };

    orders.forEach(order => {
      const orderData = {
        ...order,
        customFields: order.customFields ? JSON.parse(order.customFields) : null,
        tags: order.tags ? JSON.parse(order.tags) : [],
        orderItems: order.orderItems.map(item => ({
          ...item,
          labelsJson: item.labelsJson ? JSON.parse(item.labelsJson) : null,
          allergenFlags: item.product.allergenFlags ? JSON.parse(item.product.allergenFlags) : [],
        })),
        // KDS-specific fields
        isOverdue: order.dueAt && new Date() > new Date(order.dueAt),
        isDueSoon: order.dueAt && new Date(order.dueAt) <= new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        timeRemaining: order.dueAt ? Math.max(0, new Date(order.dueAt).getTime() - Date.now()) : null,
        totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        completedItems: order.orderItems.reduce((sum, item) => sum + item.madeQty, 0),
        progressPercent: order.orderItems.length > 0 ? 
          (order.orderItems.reduce((sum, item) => sum + item.madeQty, 0) / order.orderItems.reduce((sum, item) => sum + item.quantity, 0)) * 100 : 0,
      };
      
      // Assign to station based on order status or station field
      const station = order.station || 'PREP';
      if (stationGroups[station as keyof typeof stationGroups]) {
        stationGroups[station as keyof typeof stationGroups].push(orderData);
      }
    });

    // Calculate station totals
    const stationTotals = Object.entries(stationGroups).map(([station, orders]) => ({
      station,
      count: orders.length,
      totalItems: orders.reduce((sum, order) => sum + order.totalItems, 0),
      completedItems: orders.reduce((sum, order) => sum + order.completedItems, 0),
      overdueCount: orders.filter(order => order.isOverdue).length,
      dueSoonCount: orders.filter(order => order.isDueSoon).length,
    }));

    res.json({
      stations: stationGroups,
      totals: stationTotals,
      summary: {
        totalOrders: orders.length,
        totalItems: orders.reduce((sum, order) => sum + order.totalItems, 0),
        completedItems: orders.reduce((sum, order) => sum + order.completedItems, 0),
        overdueCount: orders.filter(order => order.isOverdue).length,
        dueSoonCount: orders.filter(order => order.isDueSoon).length,
      },
    });

  } catch (error) {
    console.error('Get KDS orders error:', error);
    res.status(500).json({ error: 'Failed to fetch KDS orders' });
  }
});

export default router;
