// Enhanced analytics testing data
export interface EnhancedKpiData {
  label: string;
  value: string;
  delta: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: string;
  description: string;
}

export interface FinancialMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
  profit: {
    current: number;
    previous: number;
    margin: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    current: number;
    previous: number;
    retention: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface BestSellerData {
  productId: string;
  name: string;
  revenue: number;
  units: number;
  reorderRate: number;
  rating: number;
  stock: number;
  category: string;
  trend: number;
  trendData: Array<{ date: string; value: number }>;
}

export interface ConversionData {
  stage: string;
  count: number;
  conversionRate: number;
  dropoff: number;
  color: string;
}

export interface TaxData {
  period: string;
  revenue: number;
  expenses: number;
  taxableIncome: number;
  estimatedTax: number;
  deductions: number;
}

export const enhancedMockKpis: EnhancedKpiData[] = [
  {
    label: "Today's Revenue",
    value: "$1,247.89",
    delta: 18.5,
    trend: 'up',
    status: 'excellent',
    icon: "💰",
    description: "Strong daily performance with 18.5% growth"
  },
  {
    label: "This Month's Revenue",
    value: "$28,450",
    delta: 12.3,
    trend: 'up',
    status: 'excellent',
    icon: "📈",
    description: "Monthly revenue showing consistent growth"
  },
  {
    label: "Avg Order Value",
    value: "$34.67",
    delta: 5.8,
    trend: 'up',
    status: 'good',
    icon: "🎯",
    description: "Order value increasing steadily"
  },
  {
    label: "Orders Today",
    value: "36",
    delta: 22.1,
    trend: 'up',
    status: 'excellent',
    icon: "📦",
    description: "High order volume today"
  },
  {
    label: "Customer Satisfaction",
    value: "4.8/5",
    delta: 0.2,
    trend: 'up',
    status: 'excellent',
    icon: "⭐",
    description: "Excellent customer ratings"
  },
  {
    label: "Return Rate",
    value: "2.1%",
    delta: -0.5,
    trend: 'down',
    status: 'excellent',
    icon: "✅",
    description: "Low return rate, quality improving"
  }
];

export const enhancedMockTrendData = {
  daily: [
    { date: "Jan 01", revenue: 1247, orders: 36, customers: 28, profit: 498 },
    { date: "Jan 02", revenue: 1189, orders: 34, customers: 31, profit: 475 },
    { date: "Jan 03", revenue: 1356, orders: 39, customers: 35, profit: 542 },
    { date: "Jan 04", revenue: 1422, orders: 41, customers: 38, profit: 568 },
    { date: "Jan 05", revenue: 1289, orders: 37, customers: 33, profit: 515 },
    { date: "Jan 06", revenue: 1567, orders: 45, customers: 42, profit: 626 },
    { date: "Jan 07", revenue: 1345, orders: 38, customers: 36, profit: 538 },
    { date: "Jan 08", revenue: 1489, orders: 43, customers: 39, profit: 595 },
    { date: "Jan 09", revenue: 1623, orders: 47, customers: 44, profit: 649 },
    { date: "Jan 10", revenue: 1398, orders: 40, customers: 37, profit: 559 }
  ],
  weekly: [
    { date: "Week 1", revenue: 8756, orders: 252, customers: 198, profit: 3502 },
    { date: "Week 2", revenue: 9234, orders: 267, customers: 223, profit: 3693 },
    { date: "Week 3", revenue: 8945, orders: 258, customers: 215, profit: 3578 },
    { date: "Week 4", revenue: 9876, orders: 285, customers: 241, profit: 3950 }
  ],
  monthly: [
    { date: "Oct", revenue: 34500, orders: 998, customers: 823, profit: 13800 },
    { date: "Nov", revenue: 37800, orders: 1092, customers: 901, profit: 15120 },
    { date: "Dec", revenue: 42300, orders: 1221, customers: 1008, profit: 16920 },
    { date: "Jan", revenue: 28450, orders: 820, customers: 677, profit: 11380 }
  ]
};

export const enhancedMockFunnelData: ConversionData[] = [
  { stage: "Store Visits", count: 2847, conversionRate: 100, dropoff: 0, color: "#3B82F6" },
  { stage: "Product Views", count: 1989, conversionRate: 69.9, dropoff: 30.1, color: "#10B981" },
  { stage: "Add to Cart", count: 1247, conversionRate: 43.8, dropoff: 26.1, color: "#F59E0B" },
  { stage: "Checkout Started", count: 892, conversionRate: 31.3, dropoff: 12.5, color: "#EF4444" },
  { stage: "Purchases", count: 820, conversionRate: 28.8, dropoff: 2.5, color: "#8B5CF6" }
];

export const enhancedMockBestSellers: BestSellerData[] = [
  {
    productId: '1',
    name: 'Classic Sourdough',
    revenue: 12450,
    units: 1383,
    reorderRate: 78.5,
    rating: 4.9,
    stock: 45,
    category: 'Bread',
    trend: 15.2,
    trendData: [
      { date: 'Jan 01', value: 45 },
      { date: 'Jan 02', value: 52 },
      { date: 'Jan 03', value: 48 },
      { date: 'Jan 04', value: 61 },
      { date: 'Jan 05', value: 55 }
    ]
  },
  {
    productId: '2',
    name: 'Cinnamon Raisin Swirl',
    revenue: 9876,
    units: 987,
    reorderRate: 65.2,
    rating: 4.8,
    stock: 23,
    category: 'Sweet Bread',
    trend: 8.7,
    trendData: [
      { date: 'Jan 01', value: 32 },
      { date: 'Jan 02', value: 38 },
      { date: 'Jan 03', value: 35 },
      { date: 'Jan 04', value: 42 },
      { date: 'Jan 05', value: 39 }
    ]
  },
  {
    productId: '6',
    name: 'Chocolate Croissant',
    revenue: 8765,
    units: 1753,
    reorderRate: 82.1,
    rating: 4.9,
    stock: 67,
    category: 'Pastry',
    trend: 22.3,
    trendData: [
      { date: 'Jan 01', value: 78 },
      { date: 'Jan 02', value: 89 },
      { date: 'Jan 03', value: 92 },
      { date: 'Jan 04', value: 101 },
      { date: 'Jan 05', value: 95 }
    ]
  },
  {
    productId: '7',
    name: 'Baguette',
    revenue: 7654,
    units: 1275,
    reorderRate: 71.8,
    rating: 4.7,
    stock: 89,
    category: 'Bread',
    trend: 12.4,
    trendData: [
      { date: 'Jan 01', value: 56 },
      { date: 'Jan 02', value: 62 },
      { date: 'Jan 03', value: 58 },
      { date: 'Jan 04', value: 67 },
      { date: 'Jan 05', value: 64 }
    ]
  },
  {
    productId: '4',
    name: 'Multigrain Seeded',
    revenue: 6543,
    units: 595,
    reorderRate: 58.9,
    rating: 4.6,
    stock: 34,
    category: 'Bread',
    trend: -2.1,
    trendData: [
      { date: 'Jan 01', value: 28 },
      { date: 'Jan 02', value: 31 },
      { date: 'Jan 03', value: 29 },
      { date: 'Jan 04', value: 26 },
      { date: 'Jan 05', value: 27 }
    ]
  }
];

export const enhancedMockFinancialMetrics: FinancialMetrics = {
  revenue: {
    current: 28450,
    previous: 25300,
    growth: 12.3,
    trend: 'up'
  },
  orders: {
    current: 820,
    previous: 731,
    growth: 12.2,
    trend: 'up'
  },
  profit: {
    current: 11380,
    previous: 10120,
    margin: 40.0,
    trend: 'up'
  },
  customers: {
    current: 677,
    previous: 598,
    retention: 87.2,
    trend: 'up'
  }
};

export const enhancedMockTaxData: TaxData[] = [
  {
    period: "Q1 2024",
    revenue: 28450,
    expenses: 17070,
    taxableIncome: 11380,
    estimatedTax: 2845,
    deductions: 2845
  },
  {
    period: "Q4 2023",
    revenue: 42300,
    expenses: 25380,
    taxableIncome: 16920,
    estimatedTax: 4230,
    deductions: 4230
  },
  {
    period: "Q3 2023",
    revenue: 37800,
    expenses: 22680,
    taxableIncome: 15120,
    estimatedTax: 3780,
    deductions: 3780
  },
  {
    period: "Q2 2023",
    revenue: 34500,
    expenses: 20700,
    taxableIncome: 13800,
    estimatedTax: 3450,
    deductions: 3450
  }
];

export const enhancedMockCustomerInsights = {
  totalCustomers: 677,
  newCustomers: 89,
  repeatCustomers: 588,
  averageOrderFrequency: 3.2,
  customerSatisfaction: 4.8,
  topCustomerSegments: [
    { segment: "Bread Lovers", percentage: 45, revenue: 12750 },
    { segment: "Pastry Enthusiasts", percentage: 32, revenue: 9100 },
    { segment: "Health Conscious", percentage: 23, revenue: 6600 }
  ],
  customerRetention: {
    month1: 95.2,
    month3: 87.4,
    month6: 78.9,
    month12: 72.3
  }
};

export const enhancedMockInventoryMetrics = {
  totalProducts: 24,
  lowStockItems: 3,
  outOfStockItems: 1,
  averageStockLevel: 67,
  topCategories: [
    { category: "Bread", items: 12, revenue: 18900 },
    { category: "Pastry", items: 8, revenue: 15600 },
    { category: "Sweet Bread", items: 4, revenue: 3950 }
  ],
  stockAlerts: [
    { product: "Herb Focaccia", currentStock: 0, reorderPoint: 10 },
    { product: "Whole Wheat Loaf", currentStock: 5, reorderPoint: 15 },
    { product: "Blueberry Muffin", currentStock: 8, reorderPoint: 20 }
  ]
};

export const enhancedMockPerformanceMetrics = {
  orderFulfillmentRate: 98.7,
  averagePreparationTime: 2.3,
  customerRating: 4.8,
  returnRate: 2.1,
  deliveryMetrics: {
    onTimeDelivery: 96.2,
    averageDeliveryTime: 3.1,
    customerDeliveryRating: 4.7
  },
  qualityMetrics: {
    freshnessScore: 4.9,
    consistencyScore: 4.8,
    presentationScore: 4.7
  }
};

export const enhancedMockAIInsights = [
  {
    type: 'positive',
    title: 'Revenue Growth Trend',
    description: 'Your revenue has grown 12.3% this month, outperforming industry average of 8.2%.',
    action: 'Consider expanding production capacity for high-demand items.',
    confidence: 94
  },
  {
    type: 'opportunity',
    title: 'Customer Retention Opportunity',
    description: 'New customer acquisition is strong, but 30-day retention could improve from 87% to 92%.',
    action: 'Implement a customer loyalty program and follow-up campaigns.',
    confidence: 87
  },
  {
    type: 'warning',
    title: 'Inventory Optimization',
    description: '3 products are below reorder points, potentially causing lost sales.',
    action: 'Review supplier lead times and adjust reorder quantities.',
    confidence: 91
  },
  {
    type: 'positive',
    title: 'Product Performance',
    description: 'Classic Sourdough and Chocolate Croissant are your top performers with 78%+ reorder rates.',
    action: 'Increase production of these items and consider similar product lines.',
    confidence: 96
  }
];

export const enhancedMockForecastData = {
  nextWeek: {
    revenue: 31200,
    orders: 890,
    customers: 745,
    confidence: 87
  },
  nextMonth: {
    revenue: 125000,
    orders: 3600,
    customers: 2800,
    confidence: 76
  },
  nextQuarter: {
    revenue: 380000,
    orders: 11000,
    customers: 8500,
    confidence: 68
  }
};
