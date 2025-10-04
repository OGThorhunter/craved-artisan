import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Package, 
  DollarSign, 
  ArrowUpDown, 
  Edit3,
  BarChart3,
  Sparkles,
  Download,
  FileText,
  Zap,
  Target,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMockVendorBestSellers, useMockVendorOverview } from '@/hooks/analytics';

interface BestSeller {
  productId: string;
  name: string;
  revenue: number;
  units: number;
  totalRevenue: number;
  qtySold: number;
  reorderRate: number;
  rating: number;
  stock: number;
  category: string;
  trend: number; // Percentage change
  trendData: Array<{ date: string; value: number }>;
}


const EnhancedBestSellers = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [limit] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'revenue' | 'units' | 'reorderRate' | 'rating'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showTrendChart, setShowTrendChart] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);

  // Use mock data instead of API calls
  const vendorId = user?.userId || 'dev-user-id';
  const { data: bestSellersData, isLoading: bestSellersLoading } = useMockVendorBestSellers(vendorId, { limit });
  const { data: overviewData, isLoading: overviewLoading } = useMockVendorOverview(vendorId, { interval: 'day' });

  const isLoading = bestSellersLoading || overviewLoading;
  
  // Transform mock data to expected format
  const baseRevenue = overviewData?.totals?.totalRevenue || 0;
  const baseOrders = overviewData?.totals?.totalOrders || 0;
  
  // Apply range-based multipliers to totals as well
  const rangeMultipliers = {
    weekly: 0.3,   // Weekly shows 30% of monthly data  
    monthly: 1.0,  // Monthly shows full data
    quarterly: 3.0 // Quarterly shows 3x monthly data
  };
  
  const multiplier = rangeMultipliers[range];
  const totalRevenue = Math.round(baseRevenue * multiplier);
  const totalOrders = Math.round(baseOrders * multiplier);
  
  // Transform items to match BestSeller interface
  const items: BestSeller[] = useMemo(() => {
    const rawItems = bestSellersData?.items || [];
    
    return rawItems.map((item, index) => ({
      productId: item.productId,
      name: item.name,
      revenue: Math.round(item.totalRevenue * multiplier),
      units: Math.round(item.qtySold * multiplier),
      totalRevenue: Math.round(item.totalRevenue * multiplier),
      qtySold: Math.round(item.qtySold * multiplier),
      reorderRate: Math.floor(Math.random() * 40) + 40, // Mock reorder rate 40-80%
      rating: Math.floor(Math.random() * 2) + 4, // Mock rating 4-5
      stock: Math.floor(Math.random() * 30) + 70, // Mock stock 70-100%
      category: ['Beverages', 'Food', 'Desserts', 'Snacks'][index % 4], // Mock categories
      trend: (Math.random() - 0.5) * 20, // Mock trend -10% to +10%
      trendData: (() => {
        // Generate trend data based on selected range
        const now = new Date();
        let dataPoints, timeUnit, labelFormat;
        
        switch (range) {
          case 'weekly':
            // Weekly view shows weekly data (7 days)
            dataPoints = 7;
            timeUnit = 24 * 60 * 60 * 1000; // 1 day in milliseconds
            labelFormat = (date) => {
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return days[date.getDay()];
            };
            break;
          case 'monthly':
            // Monthly view shows monthly data (30 days)
            dataPoints = 30;
            timeUnit = 24 * 60 * 60 * 1000; // 1 day in milliseconds
            labelFormat = (date) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[date.getMonth()]} ${date.getDate()}`;
            };
            break;
          case 'quarterly':
            // Quarterly view shows quarterly data (12 weeks)
            dataPoints = 12;
            timeUnit = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
            labelFormat = (date) => {
              // Get week of year (1-52)
              const startOfYear = new Date(date.getFullYear(), 0, 1);
              const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
              const weekOfYear = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
              return `Week ${weekOfYear}`;
            };
            break;
          default:
            // Default to monthly
            dataPoints = 30;
            timeUnit = 24 * 60 * 60 * 1000; // 1 day in milliseconds
            labelFormat = (date) => {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[date.getMonth()]} ${date.getDate()}`;
            };
            break;
        }
        
        return Array.from({ length: dataPoints }, (_, i) => {
          const date = new Date(now.getTime() - (dataPoints - 1 - i) * timeUnit);
          return {
            date: labelFormat(date),
            value: Math.floor(Math.random() * 100) + 50
          };
        });
      })()
    }));
  }, [bestSellersData, multiplier, range]);
  

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!items.length) return [];
    
    let filtered = items;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply range filter (daily/weekly/monthly)
    // In a real app, this would be handled by the API based on the range parameter
    
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
  }, [items, selectedCategory, sortField, sortDirection]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!items.length) return ['all'];
    const uniqueCategories = [...new Set(items.map(item => item.category))];
    return ['all', ...uniqueCategories];
  }, [items]);

  const handleSort = (field: 'revenue' | 'units' | 'reorderRate' | 'rating') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEditProduct = (product: BestSeller) => {
    setShowEditModal(product.productId);
    console.log(`Opening edit modal for ${product.name}`);
  };

  const handleViewTrend = (productId: string) => {
    setShowTrendChart(showTrendChart === productId ? null : productId);
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
    console.log('Exporting best sellers to PDF...');
    
    // Create a comprehensive HTML report that can be printed as PDF
    const totalRevenue = filteredAndSortedData.reduce((sum, item) => sum + item.revenue, 0);
    const totalUnits = filteredAndSortedData.reduce((sum, item) => sum + item.units, 0);
    const bestRevenueProduct = filteredAndSortedData[0];
    const mostUnitsProduct = [...filteredAndSortedData].sort((a, b) => b.units - a.units)[0];
    const highestRatedProduct = [...filteredAndSortedData].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

    const reportContent = `
      <html>
        <head>
          <title>Best Sellers Report - ${range.charAt(0).toUpperCase() + range.slice(1)}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8f9fa;
              color: #333;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              background: white; 
              padding: 30px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #e74c3c;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #2c3e50; 
              margin: 0; 
              font-size: 2.5em; 
              font-weight: 300;
            }
            .header p { 
              color: #7f8c8d; 
              margin: 10px 0 0 0; 
              font-size: 1.1em;
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin: 30px 0; 
            }
            .summary-card { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 25px; 
              border-radius: 10px; 
              text-align: center;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .summary-card h3 { 
              margin: 0 0 10px 0; 
              font-size: 0.9em; 
              opacity: 0.9; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .summary-card .value { 
              font-size: 2.2em; 
              font-weight: bold; 
              margin: 0;
            }
            .section-title { 
              color: #2c3e50; 
              font-size: 1.8em; 
              margin: 40px 0 20px 0; 
              font-weight: 300;
              border-left: 4px solid #3498db;
              padding-left: 15px;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .table th { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 15px 12px; 
              text-align: left; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-size: 0.85em;
            }
            .table td { 
              padding: 12px; 
              border-bottom: 1px solid #ecf0f1; 
              font-size: 0.9em;
            }
            .table tr:nth-child(even) { 
              background-color: #f8f9fa; 
            }
            .table tr:hover { 
              background-color: #e8f4fd; 
            }
            .rank { 
              font-weight: bold; 
              color: #e74c3c; 
              font-size: 1.1em;
            }
            .revenue { 
              font-weight: bold; 
              color: #27ae60; 
            }
            .trend-positive { 
              color: #27ae60; 
              font-weight: bold; 
            }
            .trend-negative { 
              color: #e74c3c; 
              font-weight: bold; 
            }
            .rating { 
              color: #f39c12; 
              font-weight: bold; 
            }
            .highlight-box { 
              background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
              padding: 25px; 
              border-radius: 10px; 
              margin: 30px 0;
              border-left: 5px solid #e67e22;
            }
            .highlight-box h2 { 
              color: #d35400; 
              margin: 0 0 15px 0; 
              font-size: 1.4em;
            }
            .highlight-item { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid rgba(211, 84, 0, 0.2);
            }
            .highlight-item:last-child { 
              border-bottom: none; 
            }
            .highlight-label { 
              font-weight: 600; 
              color: #d35400; 
            }
            .highlight-value { 
              font-weight: bold; 
              color: #8b4513; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Best Sellers Report</h1>
              <p>Period: ${range.charAt(0).toUpperCase() + range.slice(1)} | Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Products</h3>
                <div class="value">${filteredAndSortedData.length}</div>
              </div>
              <div class="summary-card">
                <h3>Total Revenue</h3>
                <div class="value">$${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div class="summary-card">
                <h3>Total Units Sold</h3>
                <div class="value">${totalUnits.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>
            
            <h2 class="section-title">Product Performance</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Revenue</th>
                  <th>Units Sold</th>
                  <th>Reorder Rate</th>
                  <th>Rating</th>
                  <th>Stock Level</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAndSortedData.map((item, index) => `
                  <tr>
                    <td class="rank">#${index + 1}</td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.category || 'General'}</td>
                    <td class="revenue">$${item.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${item.units.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${(item.reorderRate || 0).toFixed(2)}%</td>
                    <td class="rating">${(item.rating || 0).toFixed(2)}★</td>
                    <td>${(item.stock || 0).toFixed(2)}%</td>
                    <td class="${(item.trend || 0) >= 0 ? 'trend-positive' : 'trend-negative'}">
                      ${(item.trend || 0) > 0 ? '+' : ''}${(item.trend || 0).toFixed(2)}%
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="highlight-box">
              <h2>Top Performers</h2>
              <div class="highlight-item">
                <span class="highlight-label">Best Revenue:</span>
                <span class="highlight-value">${bestRevenueProduct?.name || 'N/A'} - $${(bestRevenueProduct?.revenue || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-label">Most Units Sold:</span>
                <span class="highlight-value">${mostUnitsProduct?.name || 'N/A'} - ${(mostUnitsProduct?.units || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} units</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-label">Highest Rating:</span>
                <span class="highlight-value">${highestRatedProduct?.name || 'N/A'} - ${(highestRatedProduct?.rating || 0).toFixed(2)}★</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.focus();
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      alert('📄 PDF Report: Please allow popups to generate the report, then use Ctrl+P to print as PDF');
    }
  };

  const getTrendIcon = (trend: number) => {
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
    if (stock < 10) return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Low Stock' };
    if (stock < 30) return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Medium Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'Good Stock' };
  };

  if (isLoading) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F2EC] rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Best Sellers</h2>
          <p className="text-gray-600 text-lg">Top performing products with detailed analytics</p>
        </div>
        <div className="flex space-x-3 items-center">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        {/* Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['weekly', 'monthly', 'quarterly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setRange(period)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  range === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
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

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
           <div className="flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-purple-600">Avg Reorder Rate</p>
              <p className="text-2xl font-bold text-purple-900">62%</p>
             </div>
            <Target className="w-8 h-8 text-purple-500" />
           </div>
         </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
           <div className="flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-orange-600">Products</p>
              <p className="text-2xl font-bold text-orange-900">{filteredAndSortedData.length}</p>
             </div>
            <ShoppingCart className="w-8 h-8 text-orange-500" />
           </div>
         </div>
       </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50">
              <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
              <th 
                  className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Revenue</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                  className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('units')}
              >
                <div className="flex items-center space-x-1">
                  <span>Units</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                  className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reorderRate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reorder Rate</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th 
                  className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
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
                const stockStatus = getStockStatus(product.stock || 0);
              return (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">#{index + 1}</p>
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
                      <span className="text-gray-900">{(product.reorderRate || 0).toFixed(2)}%</span>
                      {(product.reorderRate || 0) > 20 && <Sparkles className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-900">{(product.rating || 0).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                        {getTrendIcon(product.trend || 0)}
                      <span className={`text-sm font-medium ${getTrendColor(product.trend || 0)}`}>
                          {product.trend > 0 ? '+' : ''}{(product.trend || 0).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTrend(product.productId)}
                          className={`p-1 rounded transition-colors ${
                            showTrendChart === product.productId
                              ? 'text-white bg-green-600 hover:bg-green-700'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                        title="View Trend"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                        <button
                          onClick={() => alert(`Adding ${product.name} to promotion!`)}
                          className="p-1 rounded text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                          title="Add to Promotion"
                        >
                          <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                          className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
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
      </div>

      {/* Trend Charts */}
      {showTrendChart && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredAndSortedData.find(p => p.productId === showTrendChart)?.trendData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                labelFormatter={(value) => value}
                formatter={(value) => [value, 'Sales']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  defaultValue={filteredAndSortedData.find(p => p.productId === showEditModal)?.name}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  defaultValue={filteredAndSortedData.find(p => p.productId === showEditModal)?.category}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Food">Food</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Product updated successfully!');
                    setShowEditModal(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBestSellers; 