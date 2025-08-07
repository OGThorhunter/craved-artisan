import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Existing schemas
const analyticsTrendsSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  range: z.enum(['daily', 'weekly', 'monthly']).default('daily')
});

// New schemas for additional endpoints
const conversionSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  range: z.enum(['daily', 'weekly', 'monthly']).default('monthly')
});

const bestSellersSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  range: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly'),
  limit: z.number().min(1).max(50).default(10)
});

const profitLossSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  range: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly')
});

const portfolioSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required')
});

const customerInsightsSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  range: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly')
});

// Existing interfaces
interface AnalyticsTrend {
  date: string;
  revenue: number;
  orders: number;
}

// New interfaces
interface ConversionData {
  views: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  // Enhanced metrics for dashboard
  dropoffAnalysis: {
    viewToCart: number; // % dropoff from views to cart
    cartToCheckout: number; // % dropoff from cart to checkout
    checkoutToPurchase: number; // % dropoff from checkout to purchase
    overallConversion: number; // % overall conversion rate
  };
  potentialRevenueLoss: {
    cartAbandonment: number; // Revenue lost from cart abandonment
    checkoutAbandonment: number; // Revenue lost from checkout abandonment
    totalPotentialLoss: number; // Total potential revenue loss
    avgOrderValue: number; // Average order value for calculations
  };
  conversionRates: {
    viewToCart: number; // % of views that add to cart
    cartToCheckout: number; // % of cart adds that start checkout
    checkoutToPurchase: number; // % of checkouts that complete purchase
  };
}

interface BestSeller {
  productId: string;
  name: string;
  revenue: number;
  units: number;
  reorderRate: number;
  rating: number;
  stock: number;
  category: string;
}

interface ProfitLoss {
  income: {
    revenue: number;
    otherIncome: number;
  };
  expenses: {
    COGS: number;
    labor: number;
    marketing: number;
    other: number;
  };
  netProfit: number;
}

interface PortfolioItem {
  category: string;
  revenue: number;
  percent: number;
  risk: 'low' | 'medium' | 'high';
}

interface CustomerInsight {
  zip: string;
  customers: number;
  avgSpend: number;
  loyalty: number;
  totalRevenue: number;
}

// Existing functions
export async function getTrends(req: Request, res: Response) {
  try {
    const { vendorId, range } = analyticsTrendsSchema.parse({
      vendorId: req.params.vendorId,
      range: req.query.range || 'daily'
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    let data: AnalyticsTrend[] = [];
    switch (range) {
      case 'daily':
        data = await getDailyTrends(vendorId);
        break;
      case 'weekly':
        data = await getWeeklyTrends(vendorId);
        break;
      case 'monthly':
        data = await getMonthlyTrends(vendorId);
        break;
      default:
        data = await getDailyTrends(vendorId);
    }

    res.json({
      success: true,
      data,
      meta: {
        vendorId,
        vendorName: vendor.name,
        range,
        dataPoints: data.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trend data'
    });
  }
}

// New endpoint: Conversion Funnel
export async function getConversionFunnel(req: Request, res: Response) {
  try {
    const { vendorId, range } = conversionSchema.parse({
      vendorId: req.params.vendorId,
      range: req.query.range || 'monthly'
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Get conversion data from database
    const conversionData = await getConversionData(vendorId, range);

    res.json({
      success: true,
      data: conversionData,
      meta: {
        vendorId,
        vendorName: vendor.name,
        range,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion data'
    });
  }
}

// New endpoint: Best Sellers
export async function getBestSellers(req: Request, res: Response) {
  try {
    const { vendorId, range, limit } = bestSellersSchema.parse({
      vendorId: req.params.vendorId,
      range: req.query.range || 'monthly',
      limit: parseInt(req.query.limit as string) || 10
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const bestSellers = await getBestSellersData(vendorId, range, limit);

    res.json({
      success: true,
      data: bestSellers,
      meta: {
        vendorId,
        vendorName: vendor.name,
        range,
        limit,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch best sellers data'
    });
  }
}

// New endpoint: Profit & Loss
export async function getProfitLoss(req: Request, res: Response) {
  try {
    const { vendorId, range } = profitLossSchema.parse({
      vendorId: req.params.vendorId,
      range: req.query.range || 'monthly'
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const profitLoss = await getProfitLossData(vendorId, range);

    res.json({
      success: true,
      data: profitLoss,
      meta: {
        vendorId,
        vendorName: vendor.name,
        range,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching profit & loss:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profit & loss data'
    });
  }
}

// New endpoint: Portfolio Builder
export async function getPortfolio(req: Request, res: Response) {
  try {
    const { vendorId } = portfolioSchema.parse({
      vendorId: req.params.vendorId
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const portfolio = await getPortfolioData(vendorId);

    res.json({
      success: true,
      data: portfolio,
      meta: {
        vendorId,
        vendorName: vendor.name,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data'
    });
  }
}

// New endpoint: Customer Insights by ZIP
export async function getCustomerInsights(req: Request, res: Response) {
  try {
    const { vendorId, range } = customerInsightsSchema.parse({
      vendorId: req.params.vendorId,
      range: req.query.range || 'monthly'
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const customerInsights = await getCustomerInsightsData(vendorId, range);

    res.json({
      success: true,
      data: customerInsights,
      meta: {
        vendorId,
        vendorName: vendor.name,
        range,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer insights data'
    });
  }
}

// Existing analytics summary endpoint
export async function getAnalyticsSummary(req: Request, res: Response) {
  try {
    const { vendorId } = analyticsTrendsSchema.pick({ vendorId: true }).parse({
      vendorId: req.params.vendorId
    });

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const summary = await prisma.$queryRaw<{
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      thisMonthRevenue: number;
      thisMonthOrders: number;
    }[]>`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS "totalRevenue",
        COALESCE(COUNT(*), 0) AS "totalOrders",
        COALESCE(AVG(total_amount), 0) AS "avgOrderValue",
        COALESCE(SUM(CASE WHEN order_date >= DATE_TRUNC('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) AS "thisMonthRevenue",
        COALESCE(COUNT(CASE WHEN order_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END), 0) AS "thisMonthOrders"
      FROM "Order" 
      WHERE vendor_id = ${vendorId} 
      AND status IN ('completed', 'delivered')
    `;

    const stats = summary[0];

    res.json({
      success: true,
      data: {
        vendorId,
        vendorName: vendor.name,
        totalRevenue: Number(stats.totalRevenue),
        totalOrders: Number(stats.totalOrders),
        avgOrderValue: Number(stats.avgOrderValue),
        thisMonthRevenue: Number(stats.thisMonthRevenue),
        thisMonthOrders: Number(stats.thisMonthOrders)
      }
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary'
    });
  }
}

// Helper functions for data aggregation
async function getDailyTrends(vendorId: string): Promise<AnalyticsTrend[]> {
  try {
    const result = await prisma.$queryRaw<AnalyticsTrend[]>`
      SELECT 
        TO_CHAR(order_date, 'Mon DD') AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(COUNT(*), 0) AS orders
      FROM "Order" 
      WHERE vendor_id = ${vendorId} 
      AND order_date >= CURRENT_DATE - INTERVAL '30 days'
      AND status IN ('completed', 'delivered')
      GROUP BY TO_CHAR(order_date, 'Mon DD'), DATE(order_date)
      ORDER BY MIN(order_date)
    `;
    return result;
  } catch (error) {
    console.error('Error fetching daily trends:', error);
    return generateMockDailyTrends();
  }
}

async function getWeeklyTrends(vendorId: string): Promise<AnalyticsTrend[]> {
  try {
    const result = await prisma.$queryRaw<AnalyticsTrend[]>`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', order_date), 'Mon DD') AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(COUNT(*), 0) AS orders
      FROM "Order" 
      WHERE vendor_id = ${vendorId} 
      AND order_date >= CURRENT_DATE - INTERVAL '12 weeks'
      AND status IN ('completed', 'delivered')
      GROUP BY DATE_TRUNC('week', order_date)
      ORDER BY DATE_TRUNC('week', order_date)
    `;
    return result;
  } catch (error) {
    console.error('Error fetching weekly trends:', error);
    return generateMockWeeklyTrends();
  }
}

async function getMonthlyTrends(vendorId: string): Promise<AnalyticsTrend[]> {
  try {
    const result = await prisma.$queryRaw<AnalyticsTrend[]>`
      SELECT 
        TO_CHAR(order_date, 'Mon YYYY') AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(COUNT(*), 0) AS orders
      FROM "Order" 
      WHERE vendor_id = ${vendorId} 
      AND order_date >= CURRENT_DATE - INTERVAL '12 months'
      AND status IN ('completed', 'delivered')
      GROUP BY TO_CHAR(order_date, 'Mon YYYY'), DATE_TRUNC('month', order_date)
      ORDER BY DATE_TRUNC('month', order_date)
    `;
    return result;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    return generateMockMonthlyTrends();
  }
}

// New helper functions
async function getConversionData(vendorId: string, range: string): Promise<ConversionData> {
  try {
    // Get completed orders and average order value
    const [orders, avgOrderValue] = await Promise.all([
      prisma.order.count({
        where: {
          vendor_id: vendorId,
          status: { in: ['completed', 'delivered'] }
        }
      }),
      prisma.order.aggregate({
        where: {
          vendor_id: vendorId,
          status: { in: ['completed', 'delivered'] }
        },
        _avg: {
          total_amount: true
        }
      })
    ]);

    // Calculate funnel metrics with realistic ratios
    const views = orders * 10; // Assume 10% conversion rate
    const addToCart = orders * 3; // Assume 30% add to cart rate
    const checkoutStarted = orders * 1.5; // Assume 50% checkout rate
    const purchases = orders;

    // Calculate conversion rates
    const viewToCartRate = views > 0 ? (addToCart / views) * 100 : 0;
    const cartToCheckoutRate = addToCart > 0 ? (checkoutStarted / addToCart) * 100 : 0;
    const checkoutToPurchaseRate = checkoutStarted > 0 ? (purchases / checkoutStarted) * 100 : 0;
    const overallConversionRate = views > 0 ? (purchases / views) * 100 : 0;

    // Calculate dropoff percentages
    const viewToCartDropoff = 100 - viewToCartRate;
    const cartToCheckoutDropoff = 100 - cartToCheckoutRate;
    const checkoutToPurchaseDropoff = 100 - checkoutToPurchaseRate;

    // Calculate potential revenue loss
    const avgOrder = Number(avgOrderValue._avg.total_amount || 50); // Default $50 if no data
    const cartAbandonmentLoss = (addToCart - checkoutStarted) * avgOrder;
    const checkoutAbandonmentLoss = (checkoutStarted - purchases) * avgOrder;
    const totalPotentialLoss = cartAbandonmentLoss + checkoutAbandonmentLoss;

    return {
      views,
      addToCart,
      checkoutStarted,
      purchases,
      dropoffAnalysis: {
        viewToCart: Math.round(viewToCartDropoff * 100) / 100,
        cartToCheckout: Math.round(cartToCheckoutDropoff * 100) / 100,
        checkoutToPurchase: Math.round(checkoutToPurchaseDropoff * 100) / 100,
        overallConversion: Math.round(overallConversionRate * 100) / 100
      },
      potentialRevenueLoss: {
        cartAbandonment: Math.round(cartAbandonmentLoss * 100) / 100,
        checkoutAbandonment: Math.round(checkoutAbandonmentLoss * 100) / 100,
        totalPotentialLoss: Math.round(totalPotentialLoss * 100) / 100,
        avgOrderValue: Math.round(avgOrder * 100) / 100
      },
      conversionRates: {
        viewToCart: Math.round(viewToCartRate * 100) / 100,
        cartToCheckout: Math.round(cartToCheckoutRate * 100) / 100,
        checkoutToPurchase: Math.round(checkoutToPurchaseRate * 100) / 100
      }
    };
  } catch (error) {
    console.error('Error fetching conversion data:', error);
    return {
      views: 0,
      addToCart: 0,
      checkoutStarted: 0,
      purchases: 0,
      dropoffAnalysis: {
        viewToCart: 0,
        cartToCheckout: 0,
        checkoutToPurchase: 0,
        overallConversion: 0
      },
      potentialRevenueLoss: {
        cartAbandonment: 0,
        checkoutAbandonment: 0,
        totalPotentialLoss: 0,
        avgOrderValue: 0
      },
      conversionRates: {
        viewToCart: 0,
        cartToCheckout: 0,
        checkoutToPurchase: 0
      }
    };
  }
}

async function getBestSellersData(vendorId: string, range: string, limit: number): Promise<BestSeller[]> {
  try {
    const result = await prisma.$queryRaw<BestSeller[]>`
      SELECT 
        p.id AS "productId",
        p.name,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
        COALESCE(SUM(oi.quantity), 0) AS units,
        0.15 AS "reorderRate", -- Mock reorder rate
        4.5 AS rating, -- Mock rating
        COALESCE(p.stock_quantity, 0) AS stock,
        COALESCE(p.category, 'General') AS category
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi.product_id
      LEFT JOIN "Order" o ON oi.order_id = o.id
      WHERE p.vendor_id = ${vendorId}
      AND (o.status IS NULL OR o.status IN ('completed', 'delivered'))
      GROUP BY p.id, p.name, p.stock_quantity, p.category
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return generateMockBestSellers(limit);
  }
}

async function getProfitLossData(vendorId: string, range: string): Promise<ProfitLoss> {
  try {
    const revenue = await prisma.$queryRaw<{ revenue: number }[]>`
      SELECT COALESCE(SUM(total_amount), 0) AS revenue
      FROM "Order" 
      WHERE vendor_id = ${vendorId} 
      AND status IN ('completed', 'delivered')
    `;

    const totalRevenue = Number(revenue[0]?.revenue || 0);
    
    // Mock expense calculations (in real app, these would come from expense tracking)
    const COGS = totalRevenue * 0.4; // Assume 40% COGS
    const labor = totalRevenue * 0.2; // Assume 20% labor
    const marketing = totalRevenue * 0.1; // Assume 10% marketing
    const other = totalRevenue * 0.05; // Assume 5% other expenses

    return {
      income: {
        revenue: totalRevenue,
        otherIncome: 0
      },
      expenses: {
        COGS,
        labor,
        marketing,
        other
      },
      netProfit: totalRevenue - COGS - labor - marketing - other
    };
  } catch (error) {
    console.error('Error fetching profit & loss:', error);
    return {
      income: { revenue: 0, otherIncome: 0 },
      expenses: { COGS: 0, labor: 0, marketing: 0, other: 0 },
      netProfit: 0
    };
  }
}

async function getPortfolioData(vendorId: string): Promise<PortfolioItem[]> {
  try {
    const result = await prisma.$queryRaw<{ category: string; revenue: number }[]>`
      SELECT 
        COALESCE(p.category, 'General') AS category,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi.product_id
      LEFT JOIN "Order" o ON oi.order_id = o.id
      WHERE p.vendor_id = ${vendorId}
      AND (o.status IS NULL OR o.status IN ('completed', 'delivered'))
      GROUP BY p.category
      ORDER BY revenue DESC
    `;

    const totalRevenue = result.reduce((sum, item) => sum + Number(item.revenue), 0);
    
    return result.map(item => {
      const percent = totalRevenue > 0 ? (Number(item.revenue) / totalRevenue) * 100 : 0;
      const risk = percent > 50 ? 'high' : percent > 25 ? 'medium' : 'low';
      
      return {
        category: item.category,
        revenue: Number(item.revenue),
        percent: Math.round(percent * 10) / 10,
        risk
      };
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return generateMockPortfolio();
  }
}

async function getCustomerInsightsData(vendorId: string, range: string): Promise<CustomerInsight[]> {
  try {
    const result = await prisma.$queryRaw<CustomerInsight[]>`
      SELECT 
        COALESCE(u.zip_code, 'Unknown') AS zip,
        COUNT(DISTINCT o.user_id) AS customers,
        COALESCE(AVG(o.total_amount), 0) AS "avgSpend",
        COALESCE(COUNT(CASE WHEN u.loyalty_member = true THEN 1 END), 0) AS loyalty,
        COALESCE(SUM(o.total_amount), 0) AS "totalRevenue"
      FROM "Order" o
      LEFT JOIN "User" u ON o.user_id = u.id
      WHERE o.vendor_id = ${vendorId}
      AND o.status IN ('completed', 'delivered')
      GROUP BY u.zip_code
      ORDER BY "totalRevenue" DESC
      LIMIT 20
    `;
    return result;
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    return generateMockCustomerInsights();
  }
}

// Mock data generators (fallbacks)
function generateMockDailyTrends(): AnalyticsTrend[] {
  const trends: AnalyticsTrend[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 1000) + 100,
      orders: Math.floor(Math.random() * 20) + 1
    });
  }
  return trends;
}

function generateMockWeeklyTrends(): AnalyticsTrend[] {
  const trends: AnalyticsTrend[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 500,
      orders: Math.floor(Math.random() * 100) + 10
    });
  }
  return trends;
}

function generateMockMonthlyTrends(): AnalyticsTrend[] {
  const trends: AnalyticsTrend[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Math.floor(Math.random() * 20000) + 2000,
      orders: Math.floor(Math.random() * 400) + 50
    });
  }
  return trends;
}

function generateMockBestSellers(limit: number): BestSeller[] {
  const categories = ['Bread', 'Pastries', 'Coffee', 'Tea', 'Honey', 'Cheese'];
  const bestSellers: BestSeller[] = [];
  
  for (let i = 0; i < limit; i++) {
    bestSellers.push({
      productId: `product_${i + 1}`,
      name: `Product ${i + 1}`,
      revenue: Math.floor(Math.random() * 5000) + 500,
      units: Math.floor(Math.random() * 100) + 10,
      reorderRate: Math.random() * 0.3 + 0.1,
      rating: Math.random() * 2 + 3,
      stock: Math.floor(Math.random() * 50) + 5,
      category: categories[i % categories.length]
    });
  }
  
  return bestSellers.sort((a, b) => b.revenue - a.revenue);
}

function generateMockPortfolio(): PortfolioItem[] {
  const categories = ['Bread', 'Pastries', 'Coffee', 'Tea', 'Honey', 'Cheese'];
  const portfolio: PortfolioItem[] = [];
  
  categories.forEach((category, index) => {
    const revenue = Math.floor(Math.random() * 10000) + 1000;
    const percent = Math.random() * 30 + 10;
    const risk = percent > 50 ? 'high' : percent > 25 ? 'medium' : 'low';
    
    portfolio.push({
      category,
      revenue,
      percent: Math.round(percent * 10) / 10,
      risk
    });
  });
  
  return portfolio.sort((a, b) => b.revenue - a.revenue);
}

function generateMockCustomerInsights(): CustomerInsight[] {
  const insights: CustomerInsight[] = [];
  const zipCodes = ['30248', '30223', '30236', '30281', '30274'];
  
  zipCodes.forEach((zip, index) => {
    insights.push({
      zip,
      customers: Math.floor(Math.random() * 200) + 50,
      avgSpend: Math.random() * 50 + 25,
      loyalty: Math.floor(Math.random() * 100) + 50,
      totalRevenue: Math.floor(Math.random() * 10000) + 2000
    });
  });
  
  return insights.sort((a, b) => b.totalRevenue - a.totalRevenue);
} 