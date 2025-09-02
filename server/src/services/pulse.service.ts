import { PrismaClient } from '@prisma/client';
import type { PulsePayload, PulseRange, Kpi, TrendPoint, LeaderboardRow, AttentionPickup, AttentionInventory, AttentionCrm, SystemPill } from '../types/pulse';

// TODO: Initialize Prisma client when schema is ready
// const prisma = new PrismaClient();

/**
 * Get vendor pulse data for the specified time range
 * @param vendorId - The vendor's unique identifier
 * @param range - Time range: 'today', 'week', or 'month'
 * @returns Promise<PulsePayload> - Complete pulse data payload
 */
export async function getVendorPulse(vendorId: string, range: PulseRange): Promise<PulsePayload> {
  // Feature flag for mock data
  if (process.env.PULSE_FAKE === '1') {
    return generateMockPulseData(vendorId, range);
  }

  try {
    // TODO: Replace with actual Prisma queries when schema is ready
    // const timeWindow = getTimeWindow(range);
    
    // Example Prisma queries (commented out until schema is ready):
    // const orders = await prisma.order.findMany({
    //   where: {
    //     vendorId,
    //     createdAt: { gte: timeWindow.start, lte: timeWindow.end }
    //   },
    //   include: { items: true }
    // });
    
    // For now, return mock data
    return generateMockPulseData(vendorId, range);
    
  } catch (error) {
    console.error('Error fetching vendor pulse data:', error);
    throw new Error('Failed to fetch pulse data');
  }
}

/**
 * Generate mock pulse data for development/testing
 */
function generateMockPulseData(vendorId: string, range: PulseRange): PulsePayload {
  const now = new Date();
  const mockKpis: Kpi[] = [
    { label: 'Revenue', value: 2847.50, deltaPct: 12.5 },
    { label: 'Orders', value: 23, deltaPct: 8.7 },
    { label: 'AOV', value: 123.80, deltaPct: 3.2 },
    { label: 'Conversion %', value: 4.2, deltaPct: -0.8 },
    { label: 'Refunds', value: -125.00, deltaPct: -15.0 }
  ];

  const mockTrends = {
    revenue: generateTrendPoints(range, 1000, 3000),
    orders: generateTrendPoints(range, 15, 30)
  };

  const mockLeaderboard: LeaderboardRow[] = [
    { productId: 'prod-001', name: 'Artisan Sourdough', qty: 45, revenue: 1125.00 },
    { productId: 'prod-002', name: 'Handmade Soap Bar', qty: 38, revenue: 456.00 },
    { productId: 'prod-003', name: 'Organic Honey', qty: 32, revenue: 384.00 },
    { productId: 'prod-004', name: 'Fresh Herbs Bundle', qty: 28, revenue: 168.00 },
    { productId: 'prod-005', name: 'Local Cheese', qty: 25, revenue: 312.50 }
  ];

  const mockAttention = {
    pickups: [
      { orderId: 'ord-001', code: 'PICKUP-001', customer: 'Sarah Johnson', whenISO: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), location: 'Downtown Market' },
      { orderId: 'ord-002', code: 'PICKUP-002', customer: 'Mike Chen', whenISO: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), location: 'Westside Hub' },
      { orderId: 'ord-003', code: 'PICKUP-003', customer: 'Emma Davis', whenISO: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), location: 'Central Station' }
    ],
    inventory: [
      { sku: 'SOUR-001', name: 'Artisan Sourdough', stock: 8, reorderAt: 15 },
      { sku: 'SOAP-002', name: 'Handmade Soap Bar', stock: 12, reorderAt: 20 },
      { sku: 'HONEY-003', name: 'Organic Honey', stock: 5, reorderAt: 10 }
    ],
    crm: [
      { customerId: 'cust-001', name: 'Alex Thompson', score: 65, reason: 'Low engagement, last order 45 days ago' },
      { customerId: 'cust-002', name: 'Lisa Wang', score: 72, reason: 'Declining order frequency' },
      { customerId: 'cust-003', name: 'David Kim', score: 68, reason: 'Cart abandonment, high-value items' }
    ]
  };

  const mockSuggestions = [
    'Restock Artisan Sourdough - running low on top seller',
    'Run 15% off promotion for Handmade Soap - boost mid-tier sales',
    'Re-engage Alex Thompson with personalized email campaign',
    'Consider bulk pricing for Organic Honey - high demand period',
    'Optimize pickup locations based on customer density'
  ];

  const mockSystem: SystemPill[] = [
    { name: 'API Health', status: 'ok', note: 'All systems operational' },
    { name: 'Stripe', status: 'ok', note: 'Payment processing normal' },
    { name: 'Tax Service', status: 'warn', note: 'Rate update pending' },
    { name: 'Inventory Sync', status: 'ok', note: 'Real-time updates active' }
  ];

  return {
    vendorId,
    range,
    kpis: mockKpis,
    trends: mockTrends,
    leaderboard: mockLeaderboard,
    attention: mockAttention,
    suggestions: mockSuggestions,
    system: mockSystem,
    asOfISO: now.toISOString()
  };
}

/**
 * Generate mock trend points for the specified range
 */
function generateTrendPoints(range: PulseRange, minValue: number, maxValue: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  
  let days: number;
  switch (range) {
    case 'today':
      days = 1;
      break;
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    default:
      days = 7;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data with some variation
    const baseValue = minValue + (maxValue - minValue) * 0.6;
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const value = Math.round((baseValue * (1 + variation)) * 100) / 100;
    
    points.push({
      ts: date.toISOString(),
      value
    });
  }

  return points;
}

/**
 * Get time window for the specified range (for future Prisma queries)
 */
function getTimeWindow(range: PulseRange) {
  const now = new Date();
  const start = new Date(now);
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setDate(start.getDate() - 30);
      break;
  }
  
  return { start, end: now };
}
