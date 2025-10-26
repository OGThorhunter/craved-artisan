"use client";

import { useState, useMemo } from "react";
import { mockBestSellers } from "@/mock/analyticsData";
import { 
  ArrowRight, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Eye,
  Star,
  MapPin,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type TimeFilter = '7d' | '30d' | '90d';
type CategoryFilter = 'all' | 'Bread' | 'Pastries' | 'Snacks';

interface Product {
  name: string;
  unitsSold: number;
  revenue: number;
  percentOfOrders: number;
  reorderRate: number;
  trend: number[];
  category: string;
  stockLevel: number;
  rating: number;
  reviews: number;
  topZips: string[];
  aiInsights: string[];
}

export function BestSellersList() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter products based on category
  const filteredProducts = useMemo(() => {
    let filtered = mockBestSellers;
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    return filtered;
  }, [categoryFilter]);

  // Get trend data based on time filter
  const getTrendData = (trend: number[], filter: TimeFilter) => {
    const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
    return trend.slice(-days).map((value, index) => ({
      day: index + 1,
      sales: value
    }));
  };

  // Calculate trend direction and percentage
  const getTrendAnalysis = (trend: number[]) => {
    const recent = trend.slice(-7);
    const previous = trend.slice(-14, -7);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(change).toFixed(1),
      isSignificant: Math.abs(change) > 10
    };
  };

  // Generate AI insights
  const generateAIInsights = (product: Product) => {
    const trend = getTrendAnalysis(product.trend);
    const insights = [];
    
    if (trend.direction === 'down' && trend.isSignificant) {
      insights.push(`Sales dropped ${trend.percentage}% this week — consider boosting post`);
    }
    
    if (product.reorderRate < 50) {
      insights.push(`Low reorder rate (${product.reorderRate}%) — try customer feedback campaign`);
    }
    
    if (product.stockLevel < 30) {
      insights.push(`Low stock (${product.stockLevel}%) — restock soon to avoid lost sales`);
    }
    
    if (product.rating > 4.5) {
      insights.push(`High rating (${product.rating}★) — perfect for featured placement`);
    }
    
    return insights;
  };

  const handleAddToPromo = (product: Product) => {
    console.log(`Adding ${product.name} to promotional campaign`);
    alert(`Launching limited discount for ${product.name}`);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const categories = ['all', ...Array.from(new Set(mockBestSellers.map(p => p.category)))] as CategoryFilter[];

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-6 shadow-xl mt-6 max-w-6xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-500" />
            Best Selling Products
          </h2>
          <p className="text-gray-600">Top revenue generators with smart insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as TimeFilter[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      timeFilter === period 
                        ? "bg-[#5B6E02] text-white border-transparent" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                             <select
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                 className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6E02]"
                 aria-label="Select product category"
               >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((product, i) => {
          const trend = getTrendAnalysis(product.trend);
          const trendData = getTrendData(product.trend, timeFilter);
          const enrichedProduct: Product = {
            ...product,
            reviews: [],
            topZips: [],
            aiInsights: []
          };
          const aiInsights = generateAIInsights(enrichedProduct);
          
          return (
            <div
              key={i}
              className="border rounded-xl p-4 bg-[#F7F2EC] hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#333]">{product.name}</h3>
                    <span className="px-2 py-0.5 text-xs bg-[#5B6E02] text-white rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {product.unitsSold} units • {formatCurrency(product.revenue)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </div>

              {/* Sparkline Trend */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Sales Trend</span>
                  <div className="flex items-center gap-1">
                    {trend.direction === 'up' ? (
                      <TrendingUp size={12} className="text-green-600" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown size={12} className="text-red-600" />
                    ) : (
                      <div className="w-3 h-3 border-2 border-gray-400 rounded-full" />
                    )}
                    <span className={`text-xs font-medium ${
                      trend.direction === 'up' ? 'text-green-600' : 
                      trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.percentage}%
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={40}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value: number) => [`${value} units`, 'Sales']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#5B6E02" 
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">% of Orders</span>
                  <span className="font-medium">{product.percentOfOrders}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reorder Rate</span>
                  <span className="font-medium">{product.reorderRate}%</span>
                </div>
              </div>

              {/* AI Insights */}
              {aiInsights.length > 0 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">{aiInsights[0]}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => handleViewDetails(enrichedProduct)}
                  className="text-xs flex items-center gap-1 text-[#7F232E] hover:underline"
                >
                  <Eye size={12} />
                  Details
                </button>
                <button
                  onClick={() => handleAddToPromo(enrichedProduct)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors"
                >
                  <Plus size={12} />
                  Add to Promo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drilldown Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Performance Overview */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Performance Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedProduct.revenue)}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedProduct.unitsSold}</p>
                    <p className="text-xs text-gray-600">Units Sold</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedProduct.reorderRate}%</p>
                    <p className="text-xs text-gray-600">Reorder Rate</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{selectedProduct.rating}★</p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                </div>
              </div>

              {/* Sales Trend */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Sales Trend (Last 30 Days)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={getTrendData(selectedProduct.trend, '30d')}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} units`, 'Sales']}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#5B6E02" 
                      strokeWidth={2}
                      dot={{ fill: '#5B6E02', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Customer Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin size={16} />
                    Top ZIP Codes
                  </h4>
                  <div className="space-y-2">
                    {['30248', '30223', '30236'].map((zip, idx) => (
                      <div key={zip} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{zip}</span>
                        <span className="text-sm font-medium text-gray-600">{85 - (idx * 15)}% of orders</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Recent Reviews
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-700">"Amazing quality and taste!"</p>
                      <p className="text-xs text-gray-500">— Sarah M.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles size={16} />
                  AI Insights
                </h4>
                <div className="space-y-2">
                  {generateAIInsights(selectedProduct).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 