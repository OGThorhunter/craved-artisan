import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  Target, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingDown,
  Package,
  ArrowRight,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// API functions
const fetchLowMarginProducts = async () => {
  const response = await axios.get('/api/vendor/products/low-margin', {
    withCredentials: true
  });
  return response.data;
};

const fetchIngredientPriceAlerts = async () => {
  const response = await axios.get('/api/vendor/products/ingredient-price-alerts', {
    withCredentials: true
  });
  return response.data;
};

const batchUpdatePricing = async (data: { targetMargin: number; productIds?: string[] }) => {
  const response = await axios.post('/api/vendor/products/batch-update-pricing', data, {
    withCredentials: true
  });
  return response.data;
};

const BatchPricingPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [targetMargin, setTargetMargin] = useState(35);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // React Query hooks
  const { data: lowMarginData, isLoading: lowMarginLoading } = useQuery({
    queryKey: ['low-margin-products'],
    queryFn: fetchLowMarginProducts,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: priceAlertsData, isLoading: priceAlertsLoading } = useQuery({
    queryKey: ['ingredient-price-alerts'],
    queryFn: fetchIngredientPriceAlerts,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const batchUpdateMutation = useMutation({
    mutationFn: batchUpdatePricing,
    onSuccess: (data) => {
      toast.success(`Successfully updated ${data.summary.updated} products with new pricing`);
      queryClient.invalidateQueries({ queryKey: ['low-margin-products'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient-price-alerts'] });
      setSelectedProducts([]);
      setShowPreview(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update pricing';
      toast.error(message);
    }
  });

  const handleSelectAll = () => {
    if (lowMarginData?.lowMarginProducts) {
      const allIds = lowMarginData.lowMarginProducts.map((product: any) => product.id);
      setSelectedProducts(allIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBatchUpdate = () => {
    const productIds = selectedProducts.length > 0 ? selectedProducts : undefined;
    batchUpdateMutation.mutate({ targetMargin, productIds });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="page-container bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="responsive-heading text-gray-900">Batch Pricing Management</h1>
              <p className="text-gray-600 mt-2">
                Update pricing across your inventory based on target margins and ingredient cost changes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="responsive-text text-gray-500">Target Margin</p>
                <p className="text-lg font-semibold text-gray-900">{targetMargin}%</p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-blue-600 text-white responsive-button rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {showPreview && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="responsive-subheading text-gray-900 mb-4">Pricing Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Target Margin (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="target-margin"
                  aria-label="Target margin percentage"
                  placeholder="35"
                />
                <p className="responsive-text text-gray-500 mt-1">
                  Set your desired profit margin percentage for all products
                </p>
              </div>
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Update Scope
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={selectedProducts.length === 0}
                      onChange={() => setSelectedProducts([])}
                      className="mr-2"
                      title="Update all products with recipes"
                    />
                    All products with recipes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      value="selected"
                      checked={selectedProducts.length > 0}
                      onChange={() => {}}
                      className="mr-2"
                      title="Update only selected products"
                    />
                    Selected products only ({selectedProducts.length})
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Products</p>
                <p className="responsive-heading text-gray-900">{lowMarginData?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Low Margin Items</p>
                <p className="responsive-heading text-red-600">{lowMarginData?.count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Price Alerts</p>
                <p className="responsive-heading text-orange-600">{priceAlertsData?.count || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Target Margin</p>
                <p className="responsive-heading text-green-600">{targetMargin}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Margin Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="responsive-subheading text-gray-900">Low Margin Products</h2>
              <p className="text-gray-600 mt-1">Products with margins below 35% that need attention</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 responsive-text font-medium"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-gray-600 hover:text-gray-700 responsive-text font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          {lowMarginLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : lowMarginData?.lowMarginProducts?.length > 0 ? (
            <div className="space-y-4">
              {lowMarginData.lowMarginProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                                         <input
                       type="checkbox"
                       checked={selectedProducts.includes(product.id)}
                       onChange={() => handleProductToggle(product.id)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       title={`Select ${product.name} for batch update`}
                       aria-label={`Select ${product.name} for batch update`}
                     />
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="responsive-text text-gray-600">
                        Current Price: {formatPrice(product.price)} â€¢ 
                        Unit Cost: {formatPrice(product.marginAnalysis.unitCost)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        product.marginAnalysis.status === 'danger' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.marginAnalysis.currentMargin}%
                      </p>
                      <p className="responsive-text text-gray-500">Current Margin</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">
                        {formatPrice((product.marginAnalysis.unitCost / (1 - targetMargin / 100)))}
                      </p>
                      <p className="responsive-text text-gray-500">Suggested Price</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No Low Margin Products</h3>
              <p className="text-gray-600">All your products have healthy profit margins!</p>
            </div>
          )}
        </div>

        {/* Price Alerts */}
        {priceAlertsData?.alerts?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="responsive-subheading text-gray-900 mb-4">Ingredient Price Alerts</h2>
            <div className="space-y-4">
              {priceAlertsData.alerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.ingredientName}</h3>
                    <p className="responsive-text text-gray-600">
                      Used in: {alert.productName} â€¢ 
                      Price increase: +{alert.priceIncrease}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="responsive-text font-medium text-orange-600">
                      ${alert.currentCost} (was ${alert.previousCost})
                    </p>
                    <p className="text-xs text-gray-500">
                      Cost impact: +{formatPrice(alert.impact.costIncrease)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="responsive-subheading text-gray-900">Batch Update Actions</h2>
              <p className="text-gray-600 mt-1">
                {selectedProducts.length > 0 
                  ? `Update ${selectedProducts.length} selected products to ${targetMargin}% margin`
                  : `Update all products with recipes to ${targetMargin}% margin`
                }
              </p>
            </div>
            <button
              onClick={handleBatchUpdate}
              disabled={batchUpdateMutation.isPending}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {batchUpdateMutation.isPending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Update Pricing
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchPricingPage; 
