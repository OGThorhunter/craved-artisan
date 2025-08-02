import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, TrendingDown, DollarSign, Package, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductWithMargin {
  id: string;
  name: string;
  price: number;
  cost: number | null;
  targetMargin: number | null;
  marginAlert: boolean;
  alertNote: string | null;
  currentMargin: number;
  currentMarginPercentage: number;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MarginAlertsResponse {
  products: ProductWithMargin[];
  count: number;
  summary: {
    totalAlerts: number;
    lowMarginCount: number;
    highCostCount: number;
  };
}

const MarginAlertDashboard: React.FC = () => {
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useQuery<MarginAlertsResponse>({
    queryKey: ['margin-alerts'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/products/alerts/margin', {
        withCredentials: true
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const toggleDetails = (productId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getMarginColor = (marginPercentage: number) => {
    if (marginPercentage < 10) return 'text-red-600';
    if (marginPercentage < 20) return 'text-orange-600';
    if (marginPercentage < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMarginIcon = (marginPercentage: number) => {
    if (marginPercentage < 15) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (marginPercentage < 25) return <TrendingDown className="w-5 h-5 text-orange-500" />;
    return <DollarSign className="w-5 h-5 text-yellow-500" />;
  };

  const getAlertType = (product: ProductWithMargin) => {
    if (product.currentMarginPercentage < 15) return 'Low Margin';
    if (product.cost && product.cost / product.price > 0.7) return 'High Cost Ratio';
    if (product.targetMargin && product.currentMarginPercentage < product.targetMargin * 0.8) return 'Below Target';
    return 'Margin Alert';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load margin alerts</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-1">No Margin Alerts</h3>
          <p>All your products are within healthy margin ranges!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Margin Alerts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {data.count} product{data.count !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Total Alerts</p>
              <p className="text-2xl font-bold text-red-900">{data.summary.totalAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Low Margin</p>
              <p className="text-2xl font-bold text-orange-900">{data.summary.lowMarginCount}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">High Cost</p>
              <p className="text-2xl font-bold text-yellow-900">{data.summary.highCostCount}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {data.products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMarginIcon(product.currentMarginPercentage)}
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getAlertType(product)} • Stock: {product.stock}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getMarginColor(product.currentMarginPercentage)}`}>
                    {product.currentMarginPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    ${product.currentMargin.toFixed(2)} margin
                  </p>
                </div>
                
                <button
                  onClick={() => toggleDetails(product.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showDetails[product.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails[product.id] && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pricing Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium">
                          {product.cost ? `$${product.cost.toFixed(2)}` : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Margin:</span>
                        <span className="font-medium">
                          {product.targetMargin ? `${product.targetMargin}%` : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Alert Information</h4>
                    {product.alertNote ? (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800">{product.alertNote}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No specific alert details available</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      // Navigate to product edit page
                      window.location.href = `/vendor/products/${product.id}/edit`;
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to pricing calculator
                      window.location.href = `/vendor/products/${product.id}/pricing`;
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Pricing Calculator
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarginAlertDashboard; 