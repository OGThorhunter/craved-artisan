import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Warehouse,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastRestocked: string;
  nextRestockDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  turnoverRate: number;
  profitMargin: number;
  tags: string[];
  notes: string;
}

const AdvancedInventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');

  // Mock data - replace with actual API calls
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Artisan Sourdough Bread',
      sku: 'ASB-001',
      category: 'Bread',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 2.50,
      unitPrice: 6.99,
      supplier: 'Local Flour Co.',
      location: 'Shelf A1',
      lastRestocked: '2025-08-25',
      nextRestockDate: '2025-08-30',
      status: 'in-stock',
      turnoverRate: 15.2,
      profitMargin: 64.2,
      tags: ['popular', 'organic', 'fresh'],
      notes: 'High demand item, consider increasing max stock'
    },
    {
      id: '2',
      name: 'Whole Grain Baguette',
      sku: 'WGB-002',
      category: 'Bread',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 1.80,
      unitPrice: 5.49,
      supplier: 'Local Flour Co.',
      location: 'Shelf A2',
      lastRestocked: '2025-08-20',
      nextRestockDate: '2025-08-27',
      status: 'low-stock',
      turnoverRate: 12.8,
      profitMargin: 67.2,
      tags: ['healthy', 'popular'],
      notes: 'Restock needed soon'
    },
    // Add more mock items...
  ];

  const filteredInventory = useMemo(() => {
    return mockInventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [mockInventory, searchTerm, categoryFilter, statusFilter]);

  const sortedInventory = useMemo(() => {
    return [...filteredInventory].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.currentStock - a.currentStock;
        case 'turnover':
          return b.turnoverRate - a.turnoverRate;
        case 'margin':
          return b.profitMargin - a.profitMargin;
        default:
          return 0;
      }
    });
  }, [filteredInventory, sortBy]);

  const totalValue = useMemo(() => {
    return mockInventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
  }, [mockInventory]);

  const lowStockItems = useMemo(() => {
    return mockInventory.filter(item => item.currentStock <= item.minStock);
  }, [mockInventory]);

  const outOfStockItems = useMemo(() => {
    return mockInventory.filter(item => item.currentStock === 0);
  }, [mockInventory]);

  const getStatusColor = (status: string) => {
    const colors = {
      'in-stock': 'bg-green-100 text-green-800',
      'low-stock': 'bg-yellow-100 text-yellow-800',
      'out-of-stock': 'bg-red-100 text-red-800',
      'overstocked': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="h-4 w-4" />;
      case 'low-stock':
        return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock':
        return <XCircle className="h-4 w-4" />;
      case 'overstocked':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track stock levels, manage suppliers, and optimize inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{mockInventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="Bread">Bread</option>
              <option value="Pastry">Pastry</option>
              <option value="Cake">Cake</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="overstocked">Overstocked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort by"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="turnover">Sort by Turnover</option>
              <option value="margin">Sort by Margin</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="Grid view"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="List view"
            >
              <PieChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`p-2 rounded ${viewMode === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              aria-label="Analytics view"
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedInventory.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4">SKU: {item.sku}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock Level</span>
                    <span className="font-medium">{item.currentStock} / {item.maxStock}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.currentStock <= item.minStock ? 'bg-red-500' :
                        item.currentStock <= item.maxStock * 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit Cost</span>
                    <span className="font-medium">${item.unitCost}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-medium">${item.unitPrice}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margin</span>
                    <span className="font-medium text-green-600">{item.profitMargin.toFixed(1)}%</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Turnover</span>
                    <span className="font-medium">{item.turnoverRate.toFixed(1)}/month</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Location: {item.location}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Next restock: {item.nextRestockDate}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 btn btn-sm btn-outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </button>
                  <button className="flex-1 btn btn-sm btn-primary">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turnover
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.currentStock}</div>
                      <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.unitCost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.unitPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {item.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.turnoverRate.toFixed(1)}/month
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" aria-label="View item">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" aria-label="Edit item">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" aria-label="More options">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedInventoryManagement;
