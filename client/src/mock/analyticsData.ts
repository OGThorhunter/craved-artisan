// mock/analyticsData.ts

// Type definitions
export interface KpiData {
  label: string;
  value: string;
  delta: number;
}

export interface SalesDataPoint {
  date?: string;
  month?: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  averageOrderFrequency: number;
  customerSatisfaction: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageStockLevel: number;
}

export interface PerformanceMetrics {
  orderFulfillmentRate: number;
  averagePreparationTime: number;
  customerRating: number;
  returnRate: number;
}

export const mockKpis: KpiData[] = [
  {
    label: "Today's Revenue",
    value: "$320.45",
    delta: 12.5,
  },
  {
    label: "This Month's Revenue",
    value: "$5,220",
    delta: 8.4,
  },
  {
    label: "Avg Order Value",
    value: "$28.12",
    delta: -3.1,
  },
  {
    label: "Orders Today",
    value: "8",
    delta: 5.2,
  },
];

export const mockTrendData = {
  daily: [
    { date: "Aug 01", revenue: 210, orders: 6 },
    { date: "Aug 02", revenue: 320, orders: 8 },
    { date: "Aug 03", revenue: 180, orders: 4 },
    { date: "Aug 04", revenue: 260, orders: 7 },
    { date: "Aug 05", revenue: 400, orders: 10 },
  ],
  weekly: [
    { date: "Week 1", revenue: 1500, orders: 42 },
    { date: "Week 2", revenue: 1740, orders: 55 },
    { date: "Week 3", revenue: 1220, orders: 38 },
    { date: "Week 4", revenue: 1880, orders: 61 },
  ],
  monthly: [
    { date: "May", revenue: 6200, orders: 183 },
    { date: "Jun", revenue: 7200, orders: 211 },
    { date: "Jul", revenue: 6930, orders: 198 },
    { date: "Aug", revenue: 260, orders: 7 }, // partial
  ],
};

export const mockFunnelData = [
  { stage: "Views", count: 1200 },
  { stage: "Add to Cart", count: 860 },
  { stage: "Checkout Started", count: 490 },
  { stage: "Purchases", count: 330 },
];

export const mockProfitLossData = {
  monthly: {
    revenue: 7220,
    cogs: 2800,
    expenses: 1450,
  },
  quarterly: {
    revenue: 21890,
    cogs: 8700,
    expenses: 4500,
  },
};

export const mockCashFlow = {
  startingCash: 1200,
  inflows: [
    { label: "Sales Revenue", amount: 5220 },
    { label: "Refund Recovered", amount: 80 },
    { label: "Vendor Credit", amount: 150 },
  ],
  outflows: [
    { label: "Ingredient Purchases", amount: 1400 },
    { label: "Packaging", amount: 300 },
    { label: "Market Fees", amount: 225 },
    { label: "Software", amount: 125 },
    { label: "Utilities", amount: 90 },
    { label: "Equipment Lease", amount: 450 },
  ],
};

export const mockBalanceSheet = {
  assets: [
    { label: "Cash", amount: 1860 },
    { label: "Inventory (Raw + Baked)", amount: 750 },
    { label: "Equipment (Oven, Mixer)", amount: 4800 },
  ],
  liabilities: [
    { label: "Outstanding Invoices", amount: 600 },
    { label: "Equipment Lease", amount: 1400 },
    { label: "Credit Card Balance", amount: 320 },
  ],
};

export const mockBestSellers = [
  {
    name: "Cinnamon Raisin Sourdough",
    unitsSold: 125,
    revenue: 1625,
    percentOfOrders: 38,
    reorderRate: 62,
    trend: [12, 15, 18, 14, 16, 19, 22, 20, 18, 21, 24, 23, 25, 27, 26],
    category: "Bread",
    stockLevel: 85,
    rating: 4.9,
  },
  {
    name: "Lemon Blueberry Muffins",
    unitsSold: 92,
    revenue: 1104,
    percentOfOrders: 29,
    reorderRate: 47,
    trend: [8, 10, 12, 9, 11, 14, 13, 15, 12, 16, 18, 17, 19, 21, 20],
    category: "Pastries",
    stockLevel: 92,
    rating: 4.7,
  },
  {
    name: "Herb & Cheese Bread",
    unitsSold: 76,
    revenue: 988,
    percentOfOrders: 21,
    reorderRate: 58,
    trend: [6, 8, 10, 7, 9, 12, 11, 13, 10, 14, 16, 15, 17, 19, 18],
    category: "Bread",
    stockLevel: 78,
    rating: 4.8,
  },
  {
    name: "Granola (Almond Honey)",
    unitsSold: 55,
    revenue: 660,
    percentOfOrders: 16,
    reorderRate: 34,
    trend: [4, 6, 8, 5, 7, 10, 9, 11, 8, 12, 14, 13, 15, 17, 16],
    category: "Snacks",
    stockLevel: 95,
    rating: 4.6,
  },
  {
    name: "Artisan Croissant",
    unitsSold: 68,
    revenue: 816,
    percentOfOrders: 20,
    reorderRate: 45,
    trend: [5, 7, 9, 6, 8, 11, 10, 12, 9, 13, 15, 14, 16, 18, 17],
    category: "Pastries",
    stockLevel: 72,
    rating: 4.5,
  },
  {
    name: "Chocolate Chip Cookies",
    unitsSold: 89,
    revenue: 534,
    percentOfOrders: 26,
    reorderRate: 52,
    trend: [7, 9, 11, 8, 10, 13, 12, 14, 11, 15, 17, 16, 18, 20, 19],
    category: "Cookies",
    stockLevel: 88,
    rating: 4.8,
  },
  {
    name: "Fresh Rosemary Focaccia",
    unitsSold: 43,
    revenue: 645,
    percentOfOrders: 12,
    reorderRate: 38,
    trend: [3, 4, 6, 3, 5, 8, 7, 9, 6, 10, 12, 11, 13, 15, 14],
    category: "Bread",
    stockLevel: 67,
    rating: 4.4,
  },
  {
    name: "Mixed Berry Scones",
    unitsSold: 51,
    revenue: 612,
    percentOfOrders: 15,
    reorderRate: 41,
    trend: [4, 5, 7, 4, 6, 9, 8, 10, 7, 11, 13, 12, 14, 16, 15],
    category: "Pastries",
    stockLevel: 74,
    rating: 4.6,
  },
  {
    name: "Honey Wheat Loaf",
    unitsSold: 37,
    revenue: 444,
    percentOfOrders: 11,
    reorderRate: 29,
    trend: [2, 3, 5, 2, 4, 7, 6, 8, 5, 9, 11, 10, 12, 14, 13],
    category: "Bread",
    stockLevel: 91,
    rating: 4.3,
  },
  {
    name: "Vanilla Bean Macarons",
    unitsSold: 29,
    revenue: 580,
    percentOfOrders: 8,
    reorderRate: 35,
    trend: [2, 2, 4, 2, 3, 6, 5, 7, 4, 8, 10, 9, 11, 13, 12],
    category: "Confections",
    stockLevel: 63,
    rating: 4.9,
  },
];

// Extended analytics data for more comprehensive dashboard
export const mockAnalyticsData = {
  kpis: mockKpis,
  
  // Sales data for charts
  salesData: {
    daily: [
      { date: "2024-01-01", revenue: 245.50, orders: 12 },
      { date: "2024-01-02", revenue: 320.75, orders: 15 },
      { date: "2024-01-03", revenue: 189.25, orders: 8 },
      { date: "2024-01-04", revenue: 456.80, orders: 22 },
      { date: "2024-01-05", revenue: 298.90, orders: 14 },
      { date: "2024-01-06", revenue: 567.30, orders: 28 },
      { date: "2024-01-07", revenue: 423.60, orders: 19 },
    ] as SalesDataPoint[],
    monthly: [
      { month: "Jan", revenue: 8500, orders: 420 },
      { month: "Feb", revenue: 9200, orders: 480 },
      { month: "Mar", revenue: 7800, orders: 390 },
      { month: "Apr", revenue: 10500, orders: 520 },
      { month: "May", revenue: 11200, orders: 580 },
      { month: "Jun", revenue: 9800, orders: 490 },
    ] as SalesDataPoint[]
  },

  // Top performing products
  topProducts: [
    { name: "Artisan Sourdough", sales: 156, revenue: 2340 },
    { name: "Croissant Assortment", sales: 134, revenue: 2010 },
    { name: "Chocolate Chip Cookies", sales: 98, revenue: 1470 },
    { name: "French Baguette", sales: 87, revenue: 870 },
    { name: "Blueberry Muffins", sales: 76, revenue: 1140 },
  ] as TopProduct[],

  // Customer insights
  customerInsights: {
    totalCustomers: 1247,
    newCustomers: 89,
    repeatCustomers: 1158,
    averageOrderFrequency: 2.3,
    customerSatisfaction: 4.8,
  } as CustomerInsights,

  // Inventory metrics
  inventoryMetrics: {
    totalProducts: 24,
    lowStockItems: 3,
    outOfStockItems: 1,
    averageStockLevel: 85,
  } as InventoryMetrics,

  // Performance metrics
  performanceMetrics: {
    orderFulfillmentRate: 98.5,
    averagePreparationTime: 15,
    customerRating: 4.8,
    returnRate: 0.5,
  } as PerformanceMetrics
}; 