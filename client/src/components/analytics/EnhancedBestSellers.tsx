import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Package, 
  DollarSign, 
  Users, 
  ArrowUpDown, 
  Eye, 
  Plus, 
  Edit3,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Filter,
  Calendar,
  Download,
  FileText,
  Zap,
  Target,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMockVendorBestSellers, useMockVendorOverview } from '@/hooks/analytics';

interface BestSeller {
  productId: string;
  name: string;
  revenue: number;
  units: number;
  reorderRate: number;
  rating: number;
  stock: number;
  category: string;
  trend: number; // Percentage change
  trendData: Array<{ date: string; value: number }>;
}

interface BestSellersResponse {
  data: BestSeller[];
  meta: {
    vendorId: string;
    vendorName: string;
    range: string;
    limit: number;
    totalRevenue: number;
    totalUnits: number;
    avgReorderRate: number;
  };
}

const fetchBestSellers = async (vendorId: string, range: string = 'monthly', limit: number = 10) => {
  const response = await axios.get(`/api/vendor/${vendorId}/analytics/bestsellers?range=${range}&limit=${limit}`);
  return response.data;
};

const EnhancedBestSellers = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [limit, setLimit] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortField, setSortField] = useState<'revenue' | 'units' | 'reorderRate' | 'rating'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showTrendChart, setShowTrendChart] = useState<string | null>(null);

  // Use mock data instead of API calls
  const vendorId = user?.id || 'dev-user-id';
  const { data: bestSellersData, isLoading: bestSellersLoading } = useMockVendorBestSellers(vendorId, { limit });
  const { data: overviewData, isLoading: overviewLoading } = useMockVendorOverview(vendorId, { interval: 'day' });

  const isLoading = bestSellersLoading || overviewLoading;
  
  // Transform mock data to expected format
  const items = bestSellersData?.items || [];
  const totalRevenue = overviewData?.totals?.totalRevenue || 0;
  const totalOrders = overviewData?.totals?.totalOrders || 0;
  const avgOrderValue = overviewData?.totals?.avgOrderValue || 0;
  
  const data: BestSellersResponse | null = {
    data: items,
    meta: {
      vendorId: vendorId,
      vendorName: user?.name || 'Demo Vendor',
      range: 'monthly',
      limit: 10,
      totalRevenue,
      totalUnits: totalOrders,
      avgReorderRate: 62, // Mock average reorder rate
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!items.length) return [];
    
    let filtered = items;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply date range filter (simulated - in real app, this would be handled by the API)
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      // This would filter based on actual date data
      filtered = filtered.filter(item => {
        // Simulate date filtering
        return true;
      });
    }
    
    // Sort data
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
         });
   }, [items, selectedCategory, dateRange, customStartDate, customEndDate, sortField, sortDirection]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!items.length) return ['all'];
    const uniqueCategories = [...new Set(items.map(item => item.category))];
    return ['all', ...uniqueCategories];
  }, [items]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleAddToPromo = (product: BestSeller) => {
    console.log(`Adding ${product.name} to promotions`);
    // In real app, this would open a promo modal or API call
    alert(`🎉 ${product.name} added to promotional campaigns!`);
  };

  const handleExportCSV = () => {
    if (!filteredAndSortedData.length) return;
    
    const headers = ['Product', 'Category', 'Revenue', 'Units Sold', 'Reorder Rate', 'Rating', 'Stock', 'Trend'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(item => [
        `"${item.name}"`,
        `"${item.category}"`,
        item.revenue,
        item.units,
        `${item.reorderRate}%`,
        item.rating,
        item.stock,
        `${item.trend > 0 ? '+' : ''}${item.trend}%`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bestsellers-${range}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
    // In real app, this would generate a PDF report
    alert('📄 PDF export feature coming soon!');
  };

  const getTrendArrow = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <span className="w-4 h-4 text-gray-400">—</span>;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Out of Stock' };
    if (stock < 10) return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Low Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'In Stock' };
  };

  if (isLoading) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>Failed to load best sellers data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
          <p className="text-gray-600">Top performing products with detailed analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            aria-label="Filter by category"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            aria-label="Filter by date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {dateRange === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                aria-label="Custom start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                aria-label="Custom end date"
              />
            </div>
          </>
        )}

        {/* Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
            aria-label="Filter by time range"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

             {/* Summary Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-blue-600">Total Revenue</p>
               <p className="text-2xl font-bold text-blue-900">${totalRevenue.toLocaleString()}</p>
             </div>
             <DollarSign className="w-8 h-8 text-blue-500" />
           </div>
         </div>

         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-green-600">Total Units</p>
               <p className="text-2xl font-bold text-green-900">{totalOrders.toLocaleString()}</p>
             </div>
             <Package className="w-8 h-8 text-green-500" />
           </div>
         </div>

         <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-yellow-600">Avg Reorder Rate</p>
               <p className="text-2xl font-bold text-yellow-900">{aov.toFixed(1)}%</p>
             </div>
             <Target className="w-8 h-8 text-yellow-500" />
           </div>
         </div>

         <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-purple-600">Products</p>
               <p className="text-2xl font-bold text-purple-900">{filteredAndSortedData.length}</p>
             </div>
             <ShoppingCart className="w-8 h-8 text-purple-500" />
           </div>
         </div>
       </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
              <th 
                className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Revenue</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('units')}
              >
                <div className="flex items-center space-x-1">
                  <span>Units</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('reorderRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reorder Rate</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center space-x-1">
                  <span>Rating</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Trend</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">#{index + 1} Best Seller</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{product.units.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{product.reorderRate}%</span>
                      {product.reorderRate > 20 && <Sparkles className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-900">{product.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {getTrendArrow(product.trend)}
                      <span className={`text-sm font-medium ${getTrendColor(product.trend)}`}>
                        {product.trend > 0 ? '+' : ''}{product.trend}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToPromo(product)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Add to Promo"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowTrendChart(showTrendChart === product.productId ? null : product.productId)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="View Trend"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => console.log(`Edit ${product.name}`)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Trend Charts */}
      {showTrendChart && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend: {filteredAndSortedData.find(p => p.productId === showTrendChart)?.name}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={filteredAndSortedData.find(p => p.productId === showTrendChart)?.trendData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EnhancedBestSellers; 