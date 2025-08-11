import React, { useState } from 'react';
import { X, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useProductOverview } from '@/hooks/productAnalytics';
import { flags } from '@/lib/flags';

interface ProductDeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  productId: string;
  productName: string;
}

export default function ProductDeepDiveModal({ 
  isOpen, 
  onClose, 
  vendorId, 
  productId, 
  productName 
}: ProductDeepDiveModalProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('month');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let from: string | undefined;
    let to: string | undefined;

    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      from = weekAgo.toISOString();
      to = now.toISOString();
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      from = monthAgo.toISOString();
      to = now.toISOString();
    } else {
      from = customFrom ? new Date(customFrom).toISOString() : undefined;
      to = customTo ? new Date(customTo).toISOString() : undefined;
    }

    return { from, to };
  };

  const { from, to } = getDateRange();

  // Data fetching with feature flag support
  const productQuery = flags.PRODUCT_ANALYTICS 
    ? useProductOverview(vendorId, productId, { from, to })
    : useProductOverview(vendorId, productId, { from, to }); // For now, use same hook

  // Extract data with safe defaults
  const productData = productQuery.data || {
    totals: { revenue: 0, qtySold: 0, orders: 0 },
    series: [],
    priceHistory: undefined
  };

  const isLoading = productQuery.isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
            <p className="text-gray-600">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Date Range Controls */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'custom')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              aria-label="Select date range"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="custom">Custom</option>
            </select>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  aria-label="Start date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  aria-label="End date"
                />
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading product data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${productData.totals.revenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quantity Sold</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {productData.totals.qtySold.toLocaleString()}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Orders</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {productData.totals.orders.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                
                {productData.series.length > 0 ? (
                  <div className="space-y-4">
                    {/* Simple chart representation */}
                    <div className="h-64 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-end justify-between h-full space-x-1">
                        {productData.series.slice(-14).map((item, index) => (
                          <div key={index} className="flex flex-col items-center space-y-2">
                            <div 
                              className="bg-blue-500 rounded-t w-8"
                              style={{ 
                                height: `${Math.max(10, (item.revenue / Math.max(...productData.series.map(s => s.revenue))) * 200)}px` 
                              }}
                            ></div>
                            <span className="text-xs text-gray-500">{item.date.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Revenue: ${productData.series.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}</p>
                      <p>Total Quantity: {productData.series.reduce((sum, item) => sum + item.qty, 0).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No data available for the selected period
                  </div>
                )}
              </div>

              {/* Price History Section */}
              {productData.priceHistory && productData.priceHistory.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
                  <div className="space-y-2">
                    {productData.priceHistory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">{item.date}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!productData.totals.revenue && !productData.totals.qtySold && !productData.totals.orders && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data Available</h3>
                  <p className="text-gray-600">
                    This product hasn't had any sales in the selected period. Try adjusting your date range.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
