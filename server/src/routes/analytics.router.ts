import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const BusinessSnapshotQuerySchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Business Snapshot endpoint
router.get('/vendor/analytics/snapshot', async (req, res) => {
  try {
    // Validate query parameters
    const { dateFrom, dateTo } = BusinessSnapshotQuerySchema.parse(req.query);
    
    // Get vendor ID from session (assuming it's attached by middleware)
    const vendorId = (req as any).user?.userId;
    if (!vendorId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Convert dates to Date objects
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    logger.info({
      vendorId,
      dateFrom,
      dateTo,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, 'Fetching business snapshot data');

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: vendorId }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    // Calculate date ranges for comparison (previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    // Parallel data fetching for performance
    const [
      salesMetrics,
      funnelData,
      customerMetrics,
      productMetrics,
      zipMetrics,
      payoutData
    ] = await Promise.all([
      calculateSalesMetrics(vendorProfile.id, startDate, endDate, prevStartDate, prevEndDate),
      calculateFunnelData(vendorProfile.id, startDate, endDate),
      calculateCustomerMetrics(vendorProfile.id, startDate, endDate),
      calculateProductMetrics(vendorProfile.id, startDate, endDate),
      calculateZipMetrics(vendorProfile.id, startDate, endDate),
      calculatePayoutData(vendorProfile.id)
    ]);

    const snapshotData = {
      range: { dateFrom, dateTo },
      sales: salesMetrics,
      funnel: funnelData,
      customers: customerMetrics,
      products: productMetrics,
      zips: zipMetrics,
      payouts: payoutData
    };

    logger.info({
      vendorId,
      ordersCount: salesMetrics.ordersCount,
      netSales: salesMetrics.netSales,
      funnelStages: funnelData.stages.length
    }, 'Business snapshot data calculated successfully');

    res.json(snapshotData);

  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Error fetching business snapshot');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate sales metrics
async function calculateSalesMetrics(
  vendorProfileId: string, 
  startDate: Date, 
  endDate: Date,
  prevStartDate: Date,
  prevEndDate: Date
) {
  // Current period orders - join through orderItems to get vendor-specific orders
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['PAID'] }
    },
    include: {
      orderItems: {
        where: {
          vendorProfileId
        }
      }
    }
  });

  // Previous period orders for comparison
  const prevOrders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      createdAt: { gte: prevStartDate, lte: prevEndDate },
      status: { in: ['PAID'] }
    },
    include: {
      orderItems: {
        where: {
          vendorProfileId
        }
      }
    }
  });

  // Calculate metrics using orderItems
  const grossSales = orders.reduce((sum, order) => {
    return sum + order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
  }, 0);
  
  const refundsValue = orders.filter(order => order.status === 'REFUNDED').reduce((sum, order) => {
    return sum + order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
  }, 0);
  
  const refundsCount = orders.filter(order => order.status === 'REFUNDED').length;
  const discountsValue = 0; // Mock for now - would need discount tracking
  
  // Platform fees (assuming 5% commission)
  const platformFees = grossSales * 0.05;
  
  // Payment fees (assuming 2.9% + $0.30 per transaction)
  const paymentFees = orders.reduce((sum, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
    return sum + (orderTotal * 0.029 + 0.30);
  }, 0);

  const netSales = grossSales - refundsValue - discountsValue;
  const estNetPayout = netSales - platformFees - paymentFees;
  const ordersCount = orders.length;
  const aov = ordersCount > 0 ? netSales / ordersCount : 0;

  // Disputes (mock data for now - would need actual dispute tracking)
  const disputesOpen = Math.floor(ordersCount * 0.02); // Assume 2% dispute rate
  const disputeRate = ordersCount > 0 ? (disputesOpen / ordersCount) * 100 : 0;

  return {
    gross: grossSales,
    refundsValue,
    refundsCount,
    discountsValue,
    platformFees,
    paymentFees,
    netSales,
    estNetPayout,
    ordersCount,
    aov,
    disputesOpen,
    disputeRate
  };
}

// Helper function to calculate funnel data
async function calculateFunnelData(vendorProfileId: string, startDate: Date, endDate: Date) {
  // Get analytics events for the period
  const events = await prisma.analyticsEvent.findMany({
    where: {
      vendorProfileId,
      createdAt: { gte: startDate, lte: endDate },
      eventType: { in: ['view', 'detail', 'add_to_cart', 'checkout_start', 'purchase'] }
    }
  });

  // Group by event type
  const eventCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stages = [
    { name: 'Views', count: eventCounts.view || 0 },
    { name: 'Detail', count: eventCounts.detail || 0 },
    { name: 'AddToCart', count: eventCounts.add_to_cart || 0 },
    { name: 'Checkout', count: eventCounts.checkout_start || 0 },
    { name: 'Completed', count: eventCounts.purchase || 0 }
  ];

  // Calculate abandonment rates
  const cartAbandonment = stages[2].count > 0 
    ? ((stages[2].count - stages[3].count) / stages[2].count) * 100 
    : 0;
  
  const checkoutAbandonment = stages[3].count > 0 
    ? ((stages[3].count - stages[4].count) / stages[3].count) * 100 
    : 0;

  // Simple blockers detection
  const blockers: string[] = [];
  if (cartAbandonment > 70) blockers.push('High cart abandonment rate');
  if (checkoutAbandonment > 50) blockers.push('High checkout abandonment rate');
  if (stages[4].count === 0 && stages[0].count > 0) blockers.push('No completed purchases');

  return {
    stages,
    abandonment: {
      cartRate: cartAbandonment,
      checkoutRate: checkoutAbandonment
    },
    blockers
  };
}

// Helper function to calculate customer metrics
async function calculateCustomerMetrics(vendorProfileId: string, startDate: Date, endDate: Date) {
  // Get customers who made orders in the period
  const periodOrders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['PAID'] }
    },
    include: { user: true },
    distinct: ['userId']
  });

  // Get all customers who have ever made an order
  const allCustomers = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      status: { in: ['PAID'] }
    },
    include: { user: true },
    distinct: ['userId']
  });

  // Calculate new vs returning customers
  const newCustomers = periodOrders.filter(order => {
    const firstOrder = allCustomers.find(c => c.userId === order.userId);
    return firstOrder && firstOrder.createdAt >= startDate;
  });

  const returningCustomers = periodOrders.filter(order => {
    const firstOrder = allCustomers.find(c => c.userId === order.userId);
    return firstOrder && firstOrder.createdAt < startDate;
  });

  // Calculate repeat purchase rate
  const customersWithMultipleOrders = allCustomers.filter(customer => {
    const customerOrders = allCustomers.filter(c => c.userId === customer.userId);
    return customerOrders.length > 1;
  });

  const repeatRate = allCustomers.length > 0 
    ? (customersWithMultipleOrders.length / allCustomers.length) * 100 
    : 0;

  // Predicted churn (customers who haven't ordered in 45+ days)
  const churnThreshold = new Date();
  churnThreshold.setDate(churnThreshold.getDate() - 45);
  
  const churnedCustomers = allCustomers.filter(customer => {
    const lastOrder = allCustomers
      .filter(c => c.userId === customer.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return lastOrder && lastOrder.createdAt < churnThreshold;
  });

  const predictedChurnPct = allCustomers.length > 0 
    ? (churnedCustomers.length / allCustomers.length) * 100 
    : 0;

  // Time to second order (median)
  const customersWithSecondOrder = allCustomers.filter(customer => {
    const customerOrders = allCustomers.filter(c => c.userId === customer.userId);
    return customerOrders.length >= 2;
  });

  const timeToSecondOrderDays = customersWithSecondOrder.map(customer => {
    const customerOrders = allCustomers
      .filter(c => c.userId === customer.userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    if (customerOrders.length >= 2) {
      const firstOrder = customerOrders[0];
      const secondOrder = customerOrders[1];
      const diffTime = secondOrder.createdAt.getTime() - firstOrder.createdAt.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }).filter(days => days > 0);

  const medianTimeToSecondOrderDays = timeToSecondOrderDays.length > 0
    ? timeToSecondOrderDays.sort((a, b) => a - b)[Math.floor(timeToSecondOrderDays.length / 2)]
    : 0;

  return {
    newCount: newCustomers.length,
    returningCount: returningCustomers.length,
    repeatRate,
    predictedChurnPct,
    medianTimeToSecondOrderDays
  };
}

// Helper function to calculate product metrics
async function calculateProductMetrics(vendorProfileId: string, startDate: Date, endDate: Date) {
  // Get top products by revenue
  const productStats = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        vendorProfileId,
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID'] }
      }
    },
    _sum: {
      quantity: true,
      total: true
    },
    orderBy: {
      _sum: {
        total: 'desc'
      }
    },
    take: 10
  });

  // Get product details
  const productIds = productStats.map(stat => stat.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      vendorProfileId
    }
  });

  const topProducts = productStats.map(stat => {
    const product = products.find(p => p.id === stat.productId);
    const refundRate = Math.random() * 5; // Mock refund rate
    
    return {
      productId: stat.productId,
      name: product?.name || 'Unknown Product',
      units: stat._sum.quantity || 0,
      revenue: stat._sum.total || 0,
      refundRatePct: refundRate
    };
  });

  // Get underperforming products (mock data for now)
  const underperforming = await prisma.product.findMany({
    where: {
      vendorProfileId,
      isAvailable: true
    },
    take: 10
  }).then(products => products.map(product => ({
    productId: product.id,
    name: product.name,
    views: Math.floor(Math.random() * 200) + 100,
    orders: Math.floor(Math.random() * 5),
    revenue: Math.floor(Math.random() * 100)
  })));

  // Count low stock products
  const lowStockCount = await prisma.product.count({
    where: {
      vendorProfileId,
      stock: { lte: 10 },
      isAvailable: true
    }
  });

  return {
    top: topProducts,
    underperforming,
    lowStockCount
  };
}

// Helper function to calculate ZIP metrics
async function calculateZipMetrics(vendorProfileId: string, startDate: Date, endDate: Date) {
  const zipStats = await prisma.order.groupBy({
    by: ['zip'],
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['PAID'] },
      zip: { not: null }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 20
  });

  const totalOrders = zipStats.reduce((sum, stat) => sum + (stat._count?.id || 0), 0);

  return zipStats.map(stat => ({
    zip: stat.zip || 'Unknown',
    orders: stat._count?.id || 0,
    sharePct: totalOrders > 0 ? ((stat._count?.id || 0) / totalOrders) * 100 : 0
  }));
}

// Helper function to calculate payout data
async function calculatePayoutData(vendorProfileId: string) {
  // Mock payout data - in real implementation, this would sync with Stripe
  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Next payout in 7 days
  
  const nextPayoutAmount = 1500; // Mock amount

  // Get last 30 days fees
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30dOrders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          vendorProfileId
        }
      },
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ['PAID'] }
    },
    include: {
      orderItems: {
        where: {
          vendorProfileId
        }
      }
    }
  });

  const grossSales30d = last30dOrders.reduce((sum, order) => {
    return sum + order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
  }, 0);
  const platformFees30d = grossSales30d * 0.05;
  const paymentFees30d = last30dOrders.reduce((sum, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => orderSum + item.total, 0);
    return sum + (orderTotal * 0.029 + 0.30);
  }, 0);

  const taxCollected30d = grossSales30d * 0.08; // Mock 8% tax rate

  return {
    nextDate: nextPayoutDate.toISOString().split('T')[0],
    nextAmount: nextPayoutAmount,
    last30d: {
      platformFees: platformFees30d,
      paymentFees: paymentFees30d,
      taxCollected: taxCollected30d
    }
  };
}

export { router as analyticsRouter };
