"use client";

import { useState, useMemo } from "react";
import { mockBestSellers } from "@/mock/analyticsData";
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
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type SortField = 'revenue' | 'unitsSold' | 'percentOfOrders' | 'reorderRate' | 'rating';
type SortDirection = 'asc' | 'desc';

interface BestSeller {
  name: string;
  unitsSold: number;
  revenue: number;
  percentOfOrders: number;
  reorderRate: number;
  trend: number[];
  category: string;
  stockLevel: number;
  rating: number;
}

export function BestSellers() {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProduct, setSelectedProduct] = useState<BestSeller | null>(null);
  const [showTrendChart, setShowTrendChart] = useState(false);

  // Sort products based on selected field and direction
  const sortedProducts = useMemo(() => {
    return [...mockBestSellers].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [sortField, sortDirection]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = mockBestSellers.reduce((sum, p) => sum + p.revenue, 0);
    const totalUnits = mockBestSellers.reduce((sum, p) => sum + p.unitsSold, 0);
    const avgReorderRate = mockBestSellers.reduce((sum, p) => sum + p.reorderRate, 0) / mockBestSellers.length;
    const avgRating = mockBestSellers.reduce((sum, p) => sum + p.rating, 0) / mockBestSellers.length;

    return {
      totalRevenue,
      totalUnits,
      avgReorderRate,
      avgRating,
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewInventory = (product: BestSeller) => {
    console.log(`Viewing inventory for ${product.name}`);
    alert(`Opening inventory management for ${product.name}`);
  };

  const handleAddToPromo = (product: BestSeller) => {
    console.log(`Adding ${product.name} to promotions`);
    alert(`Adding ${product.name} to promotional campaigns`);
  };

  const handleEditProduct = (product: BestSeller) => {
    console.log(`Editing ${product.name}`);
    alert(`Opening product editor for ${product.name}`);
  };

  const handleViewDetails = (product: BestSeller) => {
    setSelectedProduct(selectedProduct?.name === product.name ? null : product);
  };

  const getStockStatus = (stockLevel: number) => {
    if (stockLevel < 20) return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
    if (stockLevel < 50) return { status: 'low', color: 'text-orange-600', icon: AlertTriangle };
    return { status: 'good', color: 'text-green-600', icon: Package };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const SortableHeader = ({ field, label, icon: Icon }: { field: SortField; label: string; icon: any }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
    >
      <Icon size={14} />
      {label}
      <ArrowUpDown size={12} className={`transition-transform ${
        sortField === field ? 'text-[#5B6E02]' : 'text-gray-400'
      }`} />
    </button>
  );

  return (
    <div className="bg-[#F7F2EC] rounded-2xl p-6 shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={24} className="text-yellow-500" />
            Best Sellers & Product Performance
          </h2>
          <p className="text-gray-600">Top revenue generators with detailed analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrendChart(!showTrendChart)}
            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart3 size={16} />
            {showTrendChart ? 'Hide Trends' : 'Show Trends'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(summaryStats.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Package size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Units</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryStats.totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Avg Reorder Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{summaryStats.avgReorderRate.toFixed(0)}%</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{summaryStats.avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-gray-700">Product</span>
              </th>
              <th className="text-left py-3 px-4">
                <SortableHeader field="revenue" label="Revenue" icon={DollarSign} />
              </th>
              <th className="text-left py-3 px-4">
                <SortableHeader field="unitsSold" label="Units Sold" icon={Package} />
              </th>
              <th className="text-left py-3 px-4">
                <SortableHeader field="percentOfOrders" label="% of Orders" icon={Users} />
              </th>
              <th className="text-left py-3 px-4">
                <SortableHeader field="reorderRate" label="Reorder Rate" icon={TrendingUp} />
              </th>
              <th className="text-left py-3 px-4">
                <SortableHeader field="rating" label="Rating" icon={Star} />
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-gray-700">Stock</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product, index) => {
              const stockStatus = getStockStatus(product.stockLevel);
              const StockIcon = stockStatus.icon;
              
              return (
                <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#5B6E02] to-[#7F232E] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-green-700">{formatCurrency(product.revenue)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-800">{product.unitsSold.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#5B6E02] h-2 rounded-full" 
                          style={{ width: `${product.percentOfOrders}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{product.percentOfOrders}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {product.reorderRate > 50 ? (
                        <TrendingUp size={14} className="text-green-600" />
                      ) : (
                        <TrendingDown size={14} className="text-red-600" />
                      )}
                      <span className={`font-medium ${
                        product.reorderRate > 50 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {product.reorderRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-800">{product.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <StockIcon size={14} className={stockStatus.color} />
                      <span className={`text-sm font-medium ${stockStatus.color}`}>
                        {product.stockLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="p-1 text-gray-600 hover:text-[#5B6E02] transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleViewInventory(product)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View in Inventory"
                      >
                        <Package size={16} />
                      </button>
                      <button
                        onClick={() => handleAddToPromo(product)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Add to Promo"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1 text-gray-600 hover:text-orange-600 transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{selectedProduct.name}</h3>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium">{formatCurrency(selectedProduct.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Units Sold:</span>
                  <span className="font-medium">{selectedProduct.unitsSold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reorder Rate:</span>
                  <span className="font-medium">{selectedProduct.reorderRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Rating:</span>
                  <span className="font-medium flex items-center gap-1">
                    {selectedProduct.rating}
                    <Star size={12} className="text-yellow-500 fill-current" />
                  </span>
                </div>
              </div>
            </div>
            
            {showTrendChart && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Sales Trend (Last 15 Days)</h4>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={selectedProduct.trend.map((value, index) => ({ day: index + 1, sales: value }))}>
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
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {sortedProducts.length} top performing products
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm bg-[#5B6E02] text-white rounded-lg hover:bg-[#4A5A01] transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              View All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 