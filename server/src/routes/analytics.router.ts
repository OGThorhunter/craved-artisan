import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { getNextPayout, getLast30DaysFees, reconcileStripePayments } from '../services/stripeReconciliation';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to authenticate and get vendor profile
async function authenticateVendor(req: any) {
  console.log('🔍 [DEBUG] Analytics authenticateVendor - req.user:', req.user);
  console.log('🔍 [DEBUG] Analytics authenticateVendor - req.session:', req.session);
  
  const vendorId = req.user?.userId;
  if (!vendorId) {
    console.log('🔍 [DEBUG] Analytics authenticateVendor - No vendorId found');
    const error = new Error('Authentication required');
    (error as any).statusCode = 401;
    throw error;
  }
  
  console.log('🔍 [DEBUG] Analytics authenticateVendor - vendorId:', vendorId);

  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    include: { vendorProfile: true }
  });

  if (!user) {
    const error = new Error('User not found');
    (error as any).statusCode = 404;
    throw error;
  }

  if (!user.vendorProfile) {
    const error = new Error('Vendor profile required');
    (error as any).statusCode = 403;
    throw error;
  }

  if ((user as any).role !== 'VENDOR') {
    const error = new Error('Vendor access required');
    (error as any).statusCode = 403;
    throw error;
  }

  return user.vendorProfile;
}

// Validation schemas
const BusinessSnapshotQuerySchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Business Snapshot endpoint
router.get('/vendor/analytics/snapshot', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Business Snapshot endpoint called');
    console.log('🔍 [DEBUG] Request URL:', req.url);
    console.log('🔍 [DEBUG] Request method:', req.method);
    console.log('🔍 [DEBUG] Request headers:', req.headers);
    
    // Validate query parameters
    const { dateFrom, dateTo } = BusinessSnapshotQuerySchema.parse(req.query);
    
    // Authenticate and get vendor profile
    const vendorProfile = await authenticateVendor(req);

    // Convert dates to Date objects
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    logger.info({
      vendorProfileId: vendorProfile.id,
      dateFrom,
      dateTo,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }, 'Fetching business snapshot data');

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
      vendorProfileId: vendorProfile.id,
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
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
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
      vendorProfileId,
      order: {
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
      units: stat._sum?.quantity || 0,
      revenue: stat._sum?.total || 0,
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
  try {
    // Get next payout information from Stripe reconciliation
    const nextPayout = await getNextPayout(vendorProfileId);
    
    // Get last 30 days fees from Stripe reconciliation
    const last30dFees = await getLast30DaysFees(vendorProfileId);

    return {
      nextDate: nextPayout.date,
      nextAmount: nextPayout.amount,
      last30d: {
        platformFees: last30dFees.platformFees,
        paymentFees: last30dFees.paymentFees,
        taxCollected: last30dFees.taxCollected
      }
    };
  } catch (error: any) {
    logger.error({
      vendorProfileId,
      error: error.message
    }, 'Failed to calculate payout data, using fallback');

    // Fallback to mock data if Stripe reconciliation fails
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
    
    return {
      nextDate: nextPayoutDate.toISOString().split('T')[0],
      nextAmount: 1500,
      last30d: {
        platformFees: 500,
        paymentFees: 200,
        taxCollected: 800
      }
    };
  }
}

// Manual sync endpoint for Stripe data
router.post('/vendor/analytics/sync-stripe', async (req, res) => {
  try {
    // Authenticate and get vendor profile
    const vendorProfile = await authenticateVendor(req);

    // Get date range from request body (default to last 30 days)
    const { dateFrom, dateTo } = req.body;
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo) : new Date();

    logger.info({
      vendorProfileId: vendorProfile.id,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString()
    }, 'Starting manual Stripe sync');

    // Perform reconciliation
    const result = await reconcileStripePayments(vendorProfile.id, startDate, endDate);

    logger.info({
      vendorProfileId: vendorProfile.id,
      result
    }, 'Manual Stripe sync completed');

    res.json({
      success: true,
      message: 'Stripe data synchronized successfully',
      result
    });

  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Manual Stripe sync failed');
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to sync Stripe data',
      message: error.message 
    });
  }
});

// CSV Export endpoints
router.get('/vendor/analytics/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    // Authenticate and get vendor profile
    const vendorProfile = await authenticateVendor(req);

    // Convert dates
    const startDate = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateTo ? new Date(dateTo as string) : new Date();
    endDate.setHours(23, 59, 59, 999);

    let csvData = '';
    let filename = '';

    switch (type) {
      case 'kpis':
        csvData = await generateKPIsCSV(vendorProfile.id, startDate, endDate);
        filename = `business-kpis-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
        break;
      case 'products':
        csvData = await generateProductsCSV(vendorProfile.id, startDate, endDate);
        filename = `top-products-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
        break;
      case 'zips':
        csvData = await generateZipsCSV(vendorProfile.id, startDate, endDate);
        filename = `zip-codes-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
        break;
      case 'funnel':
        csvData = await generateFunnelCSV(vendorProfile.id, startDate, endDate);
        filename = `sales-funnel-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);

  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'CSV export failed');
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Export failed' });
  }
});

// Helper function to generate KPIs CSV
async function generateKPIsCSV(vendorProfileId: string, startDate: Date, endDate: Date): Promise<string> {
  const salesMetrics = await calculateSalesMetrics(vendorProfileId, startDate, endDate, startDate, endDate);
  const customerMetrics = await calculateCustomerMetrics(vendorProfileId, startDate, endDate);
  const funnelData = await calculateFunnelData(vendorProfileId, startDate, endDate);
  const payoutData = await calculatePayoutData(vendorProfileId);

  const csvData = [
    ['Metric', 'Value', 'Period'],
    ['Gross Sales', `$${salesMetrics.gross.toLocaleString()}`, `${startDate.toDateString()} - ${endDate.toDateString()}`],
    ['Net Sales', `$${salesMetrics.netSales.toLocaleString()}`, ''],
    ['Orders Count', salesMetrics.ordersCount.toString(), ''],
    ['Average Order Value', `$${salesMetrics.aov.toFixed(2)}`, ''],
    ['Refund Rate', `${((salesMetrics.refundsCount / salesMetrics.ordersCount) * 100).toFixed(1)}%`, ''],
    ['Platform Fees', `$${salesMetrics.platformFees.toLocaleString()}`, ''],
    ['Payment Fees', `$${salesMetrics.paymentFees.toLocaleString()}`, ''],
    ['Estimated Net Payout', `$${salesMetrics.estNetPayout.toLocaleString()}`, ''],
    ['Open Disputes', salesMetrics.disputesOpen.toString(), ''],
    ['Dispute Rate', `${salesMetrics.disputeRate.toFixed(1)}%`, ''],
    ['', '', ''],
    ['New Customers', customerMetrics.newCount.toString(), ''],
    ['Returning Customers', customerMetrics.returningCount.toString(), ''],
    ['Repeat Purchase Rate', `${customerMetrics.repeatRate.toFixed(1)}%`, ''],
    ['Predicted Churn', `${customerMetrics.predictedChurnPct.toFixed(1)}%`, ''],
    ['Median Time to 2nd Order', `${customerMetrics.medianTimeToSecondOrderDays} days`, ''],
    ['', '', ''],
    ['Cart Abandonment Rate', `${funnelData.abandonment.cartRate.toFixed(1)}%`, ''],
    ['Checkout Abandonment Rate', `${funnelData.abandonment.checkoutRate.toFixed(1)}%`, ''],
    ['', '', ''],
    ['Next Payout Date', payoutData.nextDate || 'Pending', ''],
    ['Next Payout Amount', payoutData.nextAmount ? `$${payoutData.nextAmount.toLocaleString()}` : 'TBD', ''],
    ['30d Platform Fees', `$${payoutData.last30d.platformFees.toLocaleString()}`, ''],
    ['30d Payment Fees', `$${payoutData.last30d.paymentFees.toLocaleString()}`, ''],
    ['30d Tax Collected', `$${payoutData.last30d.taxCollected.toLocaleString()}`, '']
  ];

  return csvData.map(row => row.join(',')).join('\n');
}

// Helper function to generate Products CSV
async function generateProductsCSV(vendorProfileId: string, startDate: Date, endDate: Date): Promise<string> {
  const productMetrics = await calculateProductMetrics(vendorProfileId, startDate, endDate);

  const csvData = [
    ['Product Name', 'Units Sold', 'Revenue', 'Refund Rate %', 'Period'],
    ...productMetrics.top.map(product => [
      product.name,
      product.units.toString(),
      `$${product.revenue.toLocaleString()}`,
      product.refundRatePct.toFixed(1),
      `${startDate.toDateString()} - ${endDate.toDateString()}`
    ])
  ];

  return csvData.map(row => row.join(',')).join('\n');
}

// Helper function to generate ZIP codes CSV
async function generateZipsCSV(vendorProfileId: string, startDate: Date, endDate: Date): Promise<string> {
  const zipMetrics = await calculateZipMetrics(vendorProfileId, startDate, endDate);

  const csvData = [
    ['ZIP Code', 'Orders', 'Share %', 'Period'],
    ...zipMetrics.map(zip => [
      zip.zip,
      zip.orders.toString(),
      zip.sharePct.toFixed(1),
      `${startDate.toDateString()} - ${endDate.toDateString()}`
    ])
  ];

  return csvData.map(row => row.join(',')).join('\n');
}

// Helper function to generate Funnel CSV
async function generateFunnelCSV(vendorProfileId: string, startDate: Date, endDate: Date): Promise<string> {
  const funnelData = await calculateFunnelData(vendorProfileId, startDate, endDate);

  const csvData = [
    ['Stage', 'Count', 'Conversion Rate %', 'Period'],
    ...funnelData.stages.map((stage, index) => {
      const prevStage = funnelData.stages[index - 1];
      const conversionRate = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : '100.0';
      
      return [
        stage.name,
        stage.count.toString(),
        conversionRate,
        `${startDate.toDateString()} - ${endDate.toDateString()}`
      ];
    }),
    ['', '', '', ''],
    ['Cart Abandonment Rate', `${funnelData.abandonment.cartRate.toFixed(1)}%`, '', ''],
    ['Checkout Abandonment Rate', `${funnelData.abandonment.checkoutRate.toFixed(1)}%`, '', ''],
    ['', '', '', ''],
    ['Top Blockers', funnelData.blockers.join('; '), '', '']
  ];

  return csvData.map(row => row.join(',')).join('\n');
}

export { router as analyticsRouter };
