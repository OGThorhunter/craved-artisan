import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, ShoppingCart, CreditCard, CheckCircle, TrendingDown, DollarSign, AlertTriangle, Users, Target, TrendingUp, Download, FileText, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ConversionData {
  visitors: number;
  pageViews: number;
  addToCart: number;
  checkoutStarted: number;
  ordersCompleted: number;
  revenue: number;
}

interface ConversionMeta {
  vendorId: string;
  vendorName: string;
  range: string;
  conversionRate: number;
  avgOrderValue: number;
  topFunnelDropoff: string;
  improvementOpportunity: string;
}

const fetchConversionData = async (vendorId: string, range: string = 'monthly') => {
  const response = await axios.get(`/api/vendor/${vendorId}/analytics/conversion?range=${range}`);
  return response.data;
};

// Mock conversion data for development
const getMockConversionData = async (vendorId: string, range: string = 'monthly') => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // Generate realistic conversion funnel data
  const baseData = {
    daily: {
      visitors: 125,
      pageViews: 340,
      addToCart: 48,
      checkoutStarted: 29,
      ordersCompleted: 23,
      revenue: 4215
    },
    weekly: {
      visitors: 875,
      pageViews: 2380,
      addToCart: 340,
      checkoutStarted: 201,
      ordersCompleted: 164,
      revenue: 29505
    },
    monthly: {
      visitors: 3750,
      pageViews: 10200,
      addToCart: 1455,
      checkoutStarted: 861,
      ordersCompleted: 702,
      revenue: 126360
    }
  };

  const data = baseData[range as keyof typeof baseData] || baseData.monthly;

  return {
    data,
    meta: {
      vendorId,
      vendorName: 'Demo Vendor',
      range,
      conversionRate: 20.2,
      avgOrderValue: 180,
      topFunnelDropoff: 'Page Views to Cart',
      improvementOpportunity: 'Optimize product pages and add social proof'
    }
  };
};

  const ConversionFunnel = () => {
    const { user } = useAuth();
    const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [targetCustomers, setTargetCustomers] = useState(0);
    const [includePromoCode, setIncludePromoCode] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState('10');

    // Generate promo code function
    const generatePromoCode = () => {
      const prefixes = ['SAVE', 'CART', 'RECOVERY', 'BOOST', 'QUICK'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${randomPrefix}${randomSuffix}`;
    };

    // Mock trend data for demonstration
    const mockTrends = {
      views: 12.5,
      addToCart: -3.2,
      checkoutStarted: 8.7,
      purchases: 15.3
    };

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['conversion', user?.id, range],
    queryFn: () => getMockConversionData(user?.id || 'dev-user-id', range),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data: ConversionData | null = response?.data || null;
  const meta: ConversionMeta | null = response?.meta || null;

  if (isLoading) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>Failed to load conversion funnel data</p>
          <p className="text-xs mt-2">Error: {error?.message || 'No data available'}</p>
          <p className="text-xs mt-1">Data: {JSON.stringify(data)}</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const funnelData = [
    { name: 'Visitors', value: data.visitors, color: '#3B82F6', icon: Eye },
    { name: 'Page Views', value: data.pageViews, color: '#8B5CF6', icon: Eye },
    { name: 'Add to Cart', value: data.addToCart, color: '#10B981', icon: ShoppingCart },
    { name: 'Checkout Started', value: data.checkoutStarted, color: '#F59E0B', icon: CreditCard },
    { name: 'Orders Completed', value: data.ordersCompleted, color: '#EF4444', icon: CheckCircle }
  ];

  // Calculate dropoff percentages (what percentage was lost)
  const calculateDropoff = (current: number, previous: number) => {
    return previous > 0 ? ((previous - current) / previous) * 100 : 0;
  };

  // Calculate conversion rates (what percentage converted)
  const calculateConversion = (current: number, previous: number) => {
    return previous > 0 ? (current / previous) * 100 : 0;
  };

  const dropoffData = [
    { name: 'Page Views to Cart', value: calculateDropoff(data.addToCart, data.pageViews), color: '#F59E0B' },
    { name: 'Cart to Checkout', value: calculateDropoff(data.checkoutStarted, data.addToCart), color: '#10B981' },
    { name: 'Checkout to Purchase', value: calculateDropoff(data.ordersCompleted, data.checkoutStarted), color: '#3B82F6' }
  ];

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDropoffColor = (dropoff: number) => {
    if (dropoff <= 20) return 'text-green-600';
    if (dropoff <= 40) return 'text-yellow-600';
    return 'text-red-600';
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

  const handleExportCSV = () => {
    if (!data) return;
    
    const headers = ['Metric', 'Count', 'Conversion Rate', 'Dropoff Rate', 'Trend'];
    const csvContent = [
      headers.join(','),
      `Visitors,${data.visitors},${((data.addToCart / data.visitors) * 100).toFixed(2)}%,${calculateDropoff(data.pageViews, data.visitors).toFixed(2)}%,${mockTrends.views > 0 ? '+' : ''}${mockTrends.views.toFixed(2)}%`,
      `Page Views,${data.pageViews},${((data.addToCart / data.pageViews) * 100).toFixed(2)}%,${calculateDropoff(data.addToCart, data.pageViews).toFixed(2)}%,${mockTrends.addToCart > 0 ? '+' : ''}${mockTrends.addToCart.toFixed(2)}%`,
      `Add to Cart,${data.addToCart},${((data.checkoutStarted / data.addToCart) * 100).toFixed(2)}%,${calculateDropoff(data.checkoutStarted, data.addToCart).toFixed(2)}%,${mockTrends.checkoutStarted > 0 ? '+' : ''}${mockTrends.checkoutStarted.toFixed(2)}%`,
      `Checkout Started,${data.checkoutStarted},${((data.ordersCompleted / data.checkoutStarted) * 100).toFixed(2)}%,${calculateDropoff(data.ordersCompleted, data.checkoutStarted).toFixed(2)}%,${mockTrends.purchases > 0 ? '+' : ''}${mockTrends.purchases.toFixed(2)}%`,
      `Orders Completed,${data.ordersCompleted},${(meta?.conversionRate || 20.2).toFixed(2)}%,0.00%,${mockTrends.purchases > 0 ? '+' : ''}${mockTrends.purchases.toFixed(2)}%`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion-funnel-${range}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

    const handleExportPDF = () => {
      console.log('Exporting conversion funnel to PDF...');
      
      // Calculate metrics
      const overallConversionRate = meta?.conversionRate || 20.2;
      const avgOrderValue = meta?.avgOrderValue || 150;
      const cartAbandonmentLoss = (data.addToCart - data.checkoutStarted) * avgOrderValue;
      const checkoutAbandonmentLoss = (data.checkoutStarted - data.ordersCompleted) * avgOrderValue;
      const totalPotentialLoss = cartAbandonmentLoss + checkoutAbandonmentLoss;
      
      // Create a professional HTML report that can be printed as PDF
      const reportContent = `
        <html>
          <head>
            <title>Conversion Funnel Report - ${range.charAt(0).toUpperCase() + range.slice(1)}</title>
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
              .metrics-grid { 
                display: grid; 
                grid-template-columns: repeat(3, 1fr); 
                gap: 20px; 
                margin: 30px 0; 
              }
              .metric-card { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                padding: 25px; 
                border-radius: 10px; 
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              }
              .metric-card h3 { 
                margin: 0 0 10px 0; 
                font-size: 0.9em; 
                opacity: 0.9; 
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .metric-card .value { 
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
              .funnel-container {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 10px;
                margin: 20px 0;
                border: 2px solid #e9ecef;
              }
              .funnel-stage {
                display: flex;
                align-items: center;
                margin: 15px 0;
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
              .funnel-label {
                font-weight: 600;
                color: #2c3e50;
                min-width: 150px;
                margin-right: 20px;
              }
              .funnel-bar {
                flex: 1;
                height: 30px;
                background: #e9ecef;
                border-radius: 15px;
                margin-right: 20px;
                position: relative;
                overflow: hidden;
              }
              .funnel-fill {
                height: 100%;
                background: linear-gradient(90deg, #3498db, #2980b9);
                border-radius: 15px;
                transition: width 0.3s ease;
              }
              .funnel-value {
                font-weight: bold;
                color: #2c3e50;
                font-size: 1.2em;
                min-width: 80px;
                text-align: right;
              }
              .loss-analysis { 
                background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                padding: 25px; 
                border-radius: 10px; 
                margin: 30px 0;
                border-left: 5px solid #e67e22;
              }
              .loss-analysis h2 { 
                color: #d35400; 
                margin: 0 0 15px 0; 
                font-size: 1.4em;
              }
              .loss-item { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0; 
                border-bottom: 1px solid rgba(211, 84, 0, 0.2);
              }
              .loss-item:last-child { 
                border-bottom: none; 
              }
              .loss-label { 
                font-weight: 600; 
                color: #d35400; 
              }
              .loss-value { 
                font-weight: bold; 
                color: #8b4513; 
              }
              .conversion-summary {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                padding: 25px;
                border-radius: 10px;
                margin: 30px 0;
                border-left: 5px solid #28a745;
              }
              .conversion-summary h2 {
                color: #155724;
                margin: 0 0 15px 0;
                font-size: 1.4em;
              }
              .conversion-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(21, 87, 36, 0.2);
              }
              .conversion-item:last-child {
                border-bottom: none;
              }
              .conversion-label {
                font-weight: 600;
                color: #155724;
              }
              .conversion-value {
                font-weight: bold;
                color: #0d4f1c;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Conversion Funnel Report</h1>
                <p>Period: ${range.charAt(0).toUpperCase() + range.slice(1)} | Generated: ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="metrics-grid">
                <div class="metric-card">
                  <h3>Total Visitors</h3>
                  <div class="value">${data.visitors.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="metric-card">
                  <h3>Orders Completed</h3>
                  <div class="value">${data.ordersCompleted.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="metric-card">
                  <h3>Total Revenue</h3>
                  <div class="value">$${data.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
              </div>
              
              <h2 class="section-title">Conversion Funnel</h2>
              <div class="funnel-container">
                ${funnelData.map((item, index) => {
                  const maxValue = Math.max(...funnelData.map(d => d.value));
                  const percentage = (item.value / maxValue) * 100;
                  return `
                    <div class="funnel-stage">
                      <div class="funnel-label">${item.name}</div>
                      <div class="funnel-bar">
                        <div class="funnel-fill" style="width: ${percentage}%"></div>
                      </div>
                      <div class="funnel-value">${item.value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                  `;
                }).join('')}
              </div>
              
              <div class="conversion-summary">
                <h2>Conversion Performance</h2>
                <div class="conversion-item">
                  <span class="conversion-label">Overall Conversion Rate:</span>
                  <span class="conversion-value">${overallConversionRate.toFixed(2)}%</span>
                </div>
                <div class="conversion-item">
                  <span class="conversion-label">Average Order Value:</span>
                  <span class="conversion-value">$${avgOrderValue.toFixed(2)}</span>
                </div>
                <div class="conversion-item">
                  <span class="conversion-label">Page Views:</span>
                  <span class="conversion-value">${data.pageViews.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="conversion-item">
                  <span class="conversion-label">Add to Cart:</span>
                  <span class="conversion-value">${data.addToCart.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="conversion-item">
                  <span class="conversion-label">Checkout Started:</span>
                  <span class="conversion-value">${data.checkoutStarted.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div class="loss-analysis">
                <h2>Revenue Loss Analysis</h2>
                <div class="loss-item">
                  <span class="loss-label">Cart Abandonment Loss:</span>
                  <span class="loss-value">$${cartAbandonmentLoss.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="loss-item">
                  <span class="loss-label">Checkout Abandonment Loss:</span>
                  <span class="loss-value">$${checkoutAbandonmentLoss.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="loss-item">
                  <span class="loss-label">Total Potential Loss:</span>
                  <span class="loss-value">$${totalPotentialLoss.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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

  return (
    <div className="bg-[#F7F2EC] rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversion Funnel</h2>
          <p className="text-gray-600">Track your customer journey from views to purchases</p>
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
          <div className="flex space-x-2">
          {['daily', 'weekly', 'monthly'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
                          </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Visitors</p>
              <p className="text-2xl font-bold text-blue-900">{data.visitors.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.views)}
                <span className={`text-sm ${getTrendColor(mockTrends.views)}`}>
                  {mockTrends.views > 0 ? '+' : ''}{mockTrends.views.toFixed(2)}%
                </span>
              </div>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Add to Cart</p>
              <p className="text-2xl font-bold text-green-900">{data.addToCart.toLocaleString()}</p>
              <p className={`text-sm ${getStatusColor(((data.addToCart / data.visitors) * 100))}`}>
                {((data.addToCart / data.visitors) * 100).toFixed(2)}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.addToCart)}
                <span className={`text-sm ${getTrendColor(mockTrends.addToCart)}`}>
                  {mockTrends.addToCart > 0 ? '+' : ''}{mockTrends.addToCart.toFixed(2)}%
                </span>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Checkout Started</p>
              <p className="text-2xl font-bold text-yellow-900">{data.checkoutStarted.toLocaleString()}</p>
              <p className={`text-sm ${getStatusColor(((data.checkoutStarted / data.addToCart) * 100))}`}>
                {((data.checkoutStarted / data.addToCart) * 100).toFixed(2)}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.checkoutStarted)}
                <span className={`text-sm ${getTrendColor(mockTrends.checkoutStarted)}`}>
                  {mockTrends.checkoutStarted > 0 ? '+' : ''}{mockTrends.checkoutStarted.toFixed(2)}%
                </span>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Orders Completed</p>
              <p className="text-2xl font-bold text-red-900">{data.ordersCompleted.toLocaleString()}</p>
              <p className={`text-sm ${getStatusColor(((data.ordersCompleted / data.checkoutStarted) * 100))}`}>
                {((data.ordersCompleted / data.checkoutStarted) * 100).toFixed(2)}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.purchases)}
                <span className={`text-sm ${getTrendColor(mockTrends.purchases)}`}>
                  {mockTrends.purchases > 0 ? '+' : ''}{mockTrends.purchases.toFixed(2)}%
                </span>
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          
          {/* Simple Funnel Chart - Just Numbers */}
          <div className="space-y-4">
            {funnelData.map((item, index) => {
              const maxValue = Math.max(...funnelData.map(d => d.value));
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-lg font-bold text-gray-900">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Original Recharts Chart (commented out for debugging) */}
          {false && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Count']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dropoff Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Analysis</h3>
          <div className="space-y-4">
            {dropoffData.map((item, index) => {
              const conversionRate = Math.min(100, Math.max(0, 100 - item.value)); // Ensure between 0-100%
              const dropoffRate = Math.min(100, Math.max(0, item.value)); // Ensure between 0-100%
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-sm font-medium text-gray-700 flex-shrink-0">{item.name}</span>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <span className="text-sm text-green-600 font-semibold whitespace-nowrap">
                        {conversionRate.toFixed(1)}% converted
                      </span>
                      <span className="text-sm text-red-600 font-semibold whitespace-nowrap">
                        {dropoffRate.toFixed(1)}% dropped
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${conversionRate}%`, maxWidth: '100%' }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-gray-500 text-right whitespace-nowrap">
                      {conversionRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm font-medium text-gray-700">Overall Conversion Rate</span>
                <span className={`text-lg font-bold ${getStatusColor(meta?.conversionRate || 20.2)}`}>
                  {(meta?.conversionRate || 20.2).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Loss Analysis */}
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-900">Potential Revenue Loss</h3>
          <DollarSign className="w-6 h-6 text-red-500" />
        </div>
        
        <div className="space-y-4">
          {/* Calculation Row */}
          <div className="flex items-center justify-center space-x-4">
            {/* Cart Abandonment */}
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-600">Cart Abandonment</p>
              <p className="text-2xl font-bold text-red-900">
                ${((data.addToCart - data.checkoutStarted) * (meta?.avgOrderValue || 150)).toFixed(2)}
              </p>
              <p className="text-xs text-red-600">
                {data.addToCart - data.checkoutStarted} abandoned carts
              </p>
            </div>
            
            {/* Plus Sign */}
            <div className="text-2xl font-bold text-red-700">+</div>
            
            {/* Checkout Abandonment */}
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-600">Checkout Abandonment</p>
              <p className="text-2xl font-bold text-red-900">
                ${((data.checkoutStarted - data.ordersCompleted) * (meta?.avgOrderValue || 150)).toFixed(2)}
              </p>
              <p className="text-xs text-red-600">
                {data.checkoutStarted - data.ordersCompleted} abandoned checkouts
              </p>
            </div>
            
            {/* Equals Sign */}
            <div className="text-2xl font-bold text-red-700">=</div>
            
            {/* Total Potential Loss */}
            <div className="text-center p-4 bg-orange-100 border-2 border-orange-300 rounded-lg">
              <p className="text-sm font-medium text-orange-700">Total Potential Loss</p>
              <p className="text-2xl font-bold text-orange-900">
                ${((data.addToCart - data.ordersCompleted) * (meta?.avgOrderValue || 150)).toFixed(2)}
              </p>
              <p className="text-xs text-orange-600">
                Avg order: ${(meta?.avgOrderValue || 150).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-[#F7F2EC] rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-4 text-center">Quick Actions</h4>
          <div className="flex justify-center">
            <button 
              onClick={() => {
                setTargetCustomers(data.addToCart - data.checkoutStarted);
                setShowMessageModal(true);
              }}
              className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 text-left max-w-md bg-white border border-red-200"
            >
              <Target className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Send Abandoned Cart Messages</p>
                <p className="text-sm text-gray-600">Send custom messages to {data.addToCart - data.checkoutStarted} registered customers</p>
              </div>
            </button>
          </div>
        </div>

        {/* Custom Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Abandoned Cart Messages</h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  This message will be sent to <span className="font-semibold">{targetCustomers} customers</span> who have abandoned carts.
                </p>
                <p className="text-xs text-gray-500">
                  Customers with SMS opt-in will receive both internal system messages and SMS notifications.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Hi! We noticed you left some items in your cart. Complete your order now!"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {customMessage.length} characters
                </p>
              </div>

              {/* Promotional Code Section */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="includePromoCode"
                    checked={includePromoCode}
                    onChange={(e) => {
                      setIncludePromoCode(e.target.checked);
                      if (e.target.checked && !promoCode) {
                        setPromoCode(generatePromoCode());
                      }
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="includePromoCode" className="text-sm font-medium text-gray-700">
                    Include promotional code to encourage checkout
                  </label>
                </div>
                
                {includePromoCode && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Discount Amount (%)
                        </label>
                        <select
                          value={promoDiscount}
                          onChange={(e) => setPromoDiscount(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                          <option value="25">25%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Promo Code
                        </label>
                        <div className="flex space-x-1">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="flex-1 p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="SAVE123"
                          />
                          <button
                            type="button"
                            onClick={() => setPromoCode(generatePromoCode())}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Preview:</strong> "Use code <span className="font-mono font-bold">{promoCode}</span> for {promoDiscount}% off your order!"
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (customMessage.trim()) {
                      console.log('Sending message:', customMessage);
                      console.log('To customers:', targetCustomers);
                      console.log('Include promo code:', includePromoCode);
                      console.log('Promo code:', promoCode);
                      console.log('Discount:', promoDiscount);
                      
                      let successMessage = `✅ Message sent to ${targetCustomers} customers with abandoned carts!\n\nMessage: "${customMessage}"`;
                      
                      if (includePromoCode && promoCode) {
                        successMessage += `\n\n🎟️ Promotional code "${promoCode}" created with ${promoDiscount}% discount!`;
                      }
                      
                      alert(successMessage);
                      setShowMessageModal(false);
                      setCustomMessage('');
                      setIncludePromoCode(false);
                      setPromoCode('');
                      setPromoDiscount('10');
                    } else {
                      alert('Please enter a message before sending.');
                    }
                  }}
                  disabled={!customMessage.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Messages</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionFunnel; 