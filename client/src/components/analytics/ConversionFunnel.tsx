import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, ShoppingCart, CreditCard, CheckCircle, TrendingDown, DollarSign, AlertTriangle, Users, Target, TrendingUp, Download, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ConversionData {
  views: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  dropoffAnalysis: {
    viewToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
    overallConversion: number;
  };
  potentialRevenueLoss: {
    cartAbandonment: number;
    checkoutAbandonment: number;
    totalPotentialLoss: number;
    avgOrderValue: number;
  };
  conversionRates: {
    viewToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
  };
}

const fetchConversionData = async (vendorId: string, range: string = 'monthly') => {
  const response = await axios.get(`/api/vendor/${vendorId}/analytics/conversion?range=${range}`);
  return response.data;
};

  const ConversionFunnel = () => {
    const { user } = useAuth();
    const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

    // Mock trend data for demonstration
    const mockTrends = {
      views: 12.5,
      addToCart: -3.2,
      checkoutStarted: 8.7,
      purchases: 15.3
    };

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['conversion', user?.id, range],
    queryFn: () => fetchConversionData(user?.id || '', range),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const data: ConversionData | null = response?.data || null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>Failed to load conversion funnel data</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const funnelData = [
    { name: 'Views', value: data.views, color: '#3B82F6', icon: Eye },
    { name: 'Add to Cart', value: data.addToCart, color: '#10B981', icon: ShoppingCart },
    { name: 'Checkout Started', value: data.checkoutStarted, color: '#F59E0B', icon: CreditCard },
    { name: 'Purchases', value: data.purchases, color: '#EF4444', icon: CheckCircle }
  ];

  const dropoffData = [
    { name: 'View to Cart', value: data.dropoffAnalysis.viewToCart, color: '#EF4444' },
    { name: 'Cart to Checkout', value: data.dropoffAnalysis.cartToCheckout, color: '#F59E0B' },
    { name: 'Checkout to Purchase', value: data.dropoffAnalysis.checkoutToPurchase, color: '#10B981' }
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
      `Views,${data.views},${data.conversionRates.viewToCart}%,${data.dropoffAnalysis.viewToCart}%,${mockTrends.views > 0 ? '+' : ''}${mockTrends.views}%`,
      `Add to Cart,${data.addToCart},${data.conversionRates.cartToCheckout}%,${data.dropoffAnalysis.cartToCheckout}%,${mockTrends.addToCart > 0 ? '+' : ''}${mockTrends.addToCart}%`,
      `Checkout Started,${data.checkoutStarted},${data.conversionRates.checkoutToPurchase}%,${data.dropoffAnalysis.checkoutToPurchase}%,${mockTrends.checkoutStarted > 0 ? '+' : ''}${mockTrends.checkoutStarted}%`,
      `Purchases,${data.purchases},${data.dropoffAnalysis.overallConversion}%,0%,${mockTrends.purchases > 0 ? '+' : ''}${mockTrends.purchases}%`
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
    // In real app, this would generate a PDF report
    alert('📄 PDF export feature coming soon!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
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
              <p className="text-sm font-medium text-blue-600">Total Views</p>
              <p className="text-2xl font-bold text-blue-900">{data.views.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.views)}
                <span className={`text-sm ${getTrendColor(mockTrends.views)}`}>
                  {mockTrends.views > 0 ? '+' : ''}{mockTrends.views}%
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
              <p className={`text-sm ${getStatusColor(data.conversionRates.viewToCart)}`}>
                {data.conversionRates.viewToCart}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.addToCart)}
                <span className={`text-sm ${getTrendColor(mockTrends.addToCart)}`}>
                  {mockTrends.addToCart > 0 ? '+' : ''}{mockTrends.addToCart}%
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
              <p className={`text-sm ${getStatusColor(data.conversionRates.cartToCheckout)}`}>
                {data.conversionRates.cartToCheckout}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.checkoutStarted)}
                <span className={`text-sm ${getTrendColor(mockTrends.checkoutStarted)}`}>
                  {mockTrends.checkoutStarted > 0 ? '+' : ''}{mockTrends.checkoutStarted}%
                </span>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Purchases</p>
              <p className="text-2xl font-bold text-red-900">{data.purchases.toLocaleString()}</p>
              <p className={`text-sm ${getStatusColor(data.conversionRates.checkoutToPurchase)}`}>
                {data.conversionRates.checkoutToPurchase}% conversion
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendArrow(mockTrends.purchases)}
                <span className={`text-sm ${getTrendColor(mockTrends.purchases)}`}>
                  {mockTrends.purchases > 0 ? '+' : ''}{mockTrends.purchases}%
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
        </div>

        {/* Dropoff Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dropoff Analysis</h3>
          <div className="space-y-4">
            {dropoffData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${getDropoffColor(item.value)}`}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Conversion</span>
                <span className={`text-lg font-bold ${getStatusColor(data.dropoffAnalysis.overallConversion)}`}>
                  {data.dropoffAnalysis.overallConversion}%
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">Cart Abandonment</p>
            <p className="text-2xl font-bold text-red-900">
              ${data.potentialRevenueLoss.cartAbandonment.toLocaleString()}
            </p>
            <p className="text-xs text-red-600">
              {data.addToCart - data.checkoutStarted} abandoned carts
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">Checkout Abandonment</p>
            <p className="text-2xl font-bold text-red-900">
              ${data.potentialRevenueLoss.checkoutAbandonment.toLocaleString()}
            </p>
            <p className="text-xs text-red-600">
              {data.checkoutStarted - data.purchases} abandoned checkouts
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">Total Potential Loss</p>
            <p className="text-2xl font-bold text-red-900">
              ${data.potentialRevenueLoss.totalPotentialLoss.toLocaleString()}
            </p>
            <p className="text-xs text-red-600">
              Avg order: ${data.potentialRevenueLoss.avgOrderValue}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <Target className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Cart Recovery</p>
                <p className="text-gray-600">Send abandoned cart emails to recover {data.addToCart - data.checkoutStarted} potential sales</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Checkout Optimization</p>
                <p className="text-gray-600">Simplify checkout process to reduce {data.dropoffAnalysis.checkoutToPurchase}% dropoff</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel; 