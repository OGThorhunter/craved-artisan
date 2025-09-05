import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'wouter';
import axios from 'axios';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import AIInsightsDashboard from '@/components/ai-insights/AIInsightsDashboard';
import B2BNetworkDashboard from '@/components/b2b-network/B2BNetworkDashboard';
import AIReceiptParserDashboard from '@/components/ai-receipt-parser/AIReceiptParserDashboard';
import UnitConverterDashboard from '@/components/unit-converter/UnitConverterDashboard';
import AdvancedInventoryDashboard from '@/components/advanced-inventory/AdvancedInventoryDashboard';
import { 
  Plus, 
  AlertTriangle, 
  Package, 
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Package2,
  AlertCircle,
  CheckCircle,
  X,
  Warehouse,
  BarChart3,
  Search,
  Filter,
  Download,
  Upload,
  TrendingDown,
  Calendar,
  MapPin,
  Hash,
  MoreHorizontal,
  ArrowUpDown,
  RefreshCw,
  Clock,
  Tag,
  Brain,
  Building2,
  Receipt,
  Calculator,
  Warehouse
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods';
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier?: string;
  isAvailable: boolean;
  expirationDate?: string;
  batchNumber?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateInventoryItemData {
  name: string;
  description?: string;
  category: 'food_grade' | 'raw_materials' | 'packaging' | 'used_goods';
  unit: string;
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier?: string;
  expirationDate?: string;
  batchNumber?: string;
  location?: string;
}

interface StockAdjustment {
  id: string;
  itemId: string;
  adjustment: number;
  reason: string;
  notes?: string;
  timestamp: string;
  previousStock: number;
  newStock: number;
}

interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  expiredCount: number;
  categoryBreakdown: Record<string, number>;
  valueByCategory: Record<string, number>;
  lowStockItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
    category: string;
  }>;
  expiredItems: Array<{
    id: string;
    name: string;
    expirationDate: string;
    category: string;
  }>;
}

const LOW_STOCK_THRESHOLD = 10; // You can adjust this threshold

export default function VendorInventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [selectedItemForAdjustment, setSelectedItemForAdjustment] = useState<InventoryItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showB2BNetwork, setShowB2BNetwork] = useState(false);
  const [showAIReceiptParser, setShowAIReceiptParser] = useState(false);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [showAdvancedInventory, setShowAdvancedInventory] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateInventoryItemData>();

  // Fetch inventory items with enhanced filtering
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ['inventory', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        
        const response = await axios.get(`/api/inventory?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching inventory:', error);
        return { items: [] };
      }
    }
  });

  const inventoryItems = inventoryData?.items || [];

  // Fetch inventory analytics
  const { data: analytics } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/inventory/analytics/summary');
        return response.data as InventoryAnalytics;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }
    }
  });

  // Create inventory item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateInventoryItemData) => {
      const response = await axios.post('/api/inventory', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Inventory item added successfully!');
      reset();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add inventory item');
    }
  });

  // Update inventory item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateInventoryItemData }) => {
      const response = await axios.put(`/api/inventory/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Inventory item updated successfully!');
      reset();
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update inventory item');
    }
  });

  // Delete inventory item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/inventory/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['inventory-analytics']);
      toast.success('Inventory item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete inventory item');
    }
  });

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ id, adjustment, reason, notes }: { id: string; adjustment: number; reason: string; notes?: string }) => {
      const response = await axios.post(`/api/inventory/${id}/adjust`, {
        adjustment,
        reason,
        notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['inventory-analytics']);
      toast.success('Stock adjusted successfully!');
      setShowStockAdjustment(false);
      setSelectedItemForAdjustment(null);
    },
    onError: () => {
      toast.error('Failed to adjust stock');
    }
  });

  const onSubmit = (data: CreateInventoryItemData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description || '',
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier || '',
      expirationDate: item.expirationDate || '',
      batchNumber: item.batchNumber || '',
      location: item.location || ''
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    reset();
  };

  const handleDelete = (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItemForAdjustment(item);
    setShowStockAdjustment(true);
  };

  const handleAdjustStock = (adjustment: number, reason: string, notes?: string) => {
    if (selectedItemForAdjustment) {
      adjustStockMutation.mutate({
        id: selectedItemForAdjustment.id,
        adjustment,
        reason,
        notes
      });
    }
  };

  const handleSort = (field: 'name' | 'stock' | 'value' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Category', 'Current Stock', 'Reorder Point', 'Cost per Unit', 'Total Value', 'Supplier', 'Location'],
      ...inventoryItems.map(item => [
        item.name,
        item.category,
        item.currentStock.toString(),
        item.reorderPoint.toString(),
        item.costPerUnit.toString(),
        (item.currentStock * item.costPerUnit).toString(),
        item.supplier || '',
        item.location || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort inventory items
  const filteredItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'value':
          aValue = a.currentStock * a.costPerUnit;
          bValue = b.currentStock * b.costPerUnit;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate stats (use analytics data when available)
  const totalItems = analytics?.totalItems || inventoryItems.length;
  const availableItems = inventoryItems.filter(i => i.isAvailable).length;
  const lowStockItems = analytics?.lowStockCount || inventoryItems.filter(i => i.currentStock <= i.reorderPoint).length;
  const totalValue = analytics?.totalValue || inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="responsive-subheading text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600">Failed to load your ingredients. Please try again.</p>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
      <div className="py-8 bg-white min-h-screen">
        <div className="container-responsive">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="responsive-heading text-gray-900">Warehouse Management</h1>
              <p className="mt-2 text-gray-600">Manage your inventory, track stock levels, and optimize your warehouse operations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdvancedInventory(true)}
                className="inline-flex items-center gap-2 responsive-button bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Warehouse className="w-4 h-4" />
                Advanced Inventory
              </button>
              <button
                onClick={() => setShowUnitConverter(true)}
                className="inline-flex items-center gap-2 responsive-button bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Unit Converter
              </button>
              <button
                onClick={() => setShowAIReceiptParser(true)}
                className="inline-flex items-center gap-2 responsive-button bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                AI Parser
              </button>
              <button
                onClick={() => setShowB2BNetwork(true)}
                className="inline-flex items-center gap-2 responsive-button bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                B2B Network
              </button>
              <button
                onClick={() => setShowAIInsights(true)}
                className="inline-flex items-center gap-2 responsive-button bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="inline-flex items-center gap-2 responsive-button bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 responsive-button bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Stock Item
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-offwhite rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-amber-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Warehouse className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Items</p>
                <p className="responsive-heading text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-offwhite rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-amber-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">In Stock</p>
                <p className="responsive-heading text-gray-900">{availableItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-offwhite rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-amber-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Reorder Needed</p>
                <p className="responsive-heading text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-offwhite rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-amber-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="responsive-text font-medium text-gray-600">Total Value</p>
                <p className="responsive-heading text-gray-900">
                  ${totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="bg-offwhite rounded-lg shadow-lg border border-amber-200 mb-8">
            <div className="px-6 py-4 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <h3 className="responsive-subheading text-gray-900">Inventory Analytics</h3>
                <button
                  onClick={() => setShowAIInsights(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                >
                  <Brain className="w-4 h-4" />
                  AI Insights
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.categoryBreakdown.food_grade || 0}</div>
                  <div className="text-sm text-gray-600">Food Grade Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.categoryBreakdown.raw_materials || 0}</div>
                  <div className="text-sm text-gray-600">Raw Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.categoryBreakdown.packaging || 0}</div>
                  <div className="text-sm text-gray-600">Packaging Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.categoryBreakdown.used_goods || 0}</div>
                  <div className="text-sm text-gray-600">Used Goods</div>
                </div>
              </div>
              
              {analytics.lowStockItems.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="responsive-text font-medium text-gray-900">Low Stock Items</h4>
                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      {analytics.lowStockItems.length} items need attention
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analytics.lowStockItems.map(item => (
                      <div key={item.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-orange-800">{item.name}</span>
                          <span className="text-sm text-orange-600">
                            {item.currentStock} / {item.reorderPoint}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            // Trigger auto-sourcing for this item
                            setShowB2BNetwork(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                        >
                          <Building2 className="w-3 h-3" />
                          Auto-Source
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.expiredItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="responsive-text font-medium text-gray-900">Expired Items</h4>
                    <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      {analytics.expiredItems.length} items expired
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analytics.expiredItems.map(item => (
                      <div key={item.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-800">{item.name}</span>
                          <span className="text-sm text-red-600">
                            Expired: {new Date(item.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-offwhite rounded-lg shadow-lg border border-amber-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="food_grade">Food Grade</option>
                  <option value="raw_materials">Raw Materials</option>
                  <option value="packaging">Packaging</option>
                  <option value="used_goods">Used Goods</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort by"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="stock-asc">Stock Low-High</option>
                  <option value="stock-desc">Stock High-Low</option>
                  <option value="value-asc">Value Low-High</option>
                  <option value="value-desc">Value High-Low</option>
                  <option value="category-asc">Category A-Z</option>
                </select>
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Table View"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title="Grid View"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-offwhite rounded-lg shadow-lg border border-amber-200 mb-8">
            <div className="px-6 py-4 border-b border-amber-200">
              <h3 className="responsive-subheading text-gray-900">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Organic Flour"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select category"
                  >
                    <option value="">Select category</option>
                    <option value="food_grade">Food Grade</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="packaging">Packaging</option>
                    <option value="used_goods">Used Goods</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    {...register('unit', { required: 'Unit is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select unit"
                  >
                    <option value="">Select unit</option>
                    <option value="grams">Grams</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="ounces">Ounces</option>
                    <option value="pounds">Pounds</option>
                    <option value="cups">Cups</option>
                    <option value="tablespoons">Tablespoons</option>
                    <option value="teaspoons">Teaspoons</option>
                    <option value="pieces">Pieces</option>
                    <option value="bottles">Bottles</option>
                    <option value="packages">Packages</option>
                    <option value="liters">Liters</option>
                    <option value="gallons">Gallons</option>
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('currentStock', { 
                      required: 'Current stock is required',
                      min: { value: 0, message: 'Stock must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {errors.currentStock && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentStock.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Reorder Point *
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('reorderPoint', { 
                      required: 'Reorder point is required',
                      min: { value: 0, message: 'Reorder point must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  {errors.reorderPoint && (
                    <p className="mt-1 text-sm text-red-600">{errors.reorderPoint.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Cost per Unit *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('costPerUnit', { 
                      required: 'Cost per unit is required',
                      min: { value: 0, message: 'Cost must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.costPerUnit && (
                    <p className="mt-1 text-sm text-red-600">{errors.costPerUnit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    {...register('supplier')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Local Market"
                  />
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Shelf A-1"
                  />
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    {...register('batchNumber')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BATCH-2024-001"
                  />
                </div>

                <div>
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    {...register('expirationDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block responsive-text font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description of the ingredient..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="responsive-button text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory List */}
        <div className="bg-offwhite rounded-lg shadow-lg border border-amber-200">
          <div className="px-6 py-4 border-b border-amber-200">
            <h3 className="responsive-subheading text-gray-900">Inventory Items</h3>
          </div>
          
          {inventoryItems.length === 0 ? (
            <div className="p-8 text-center">
              <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No inventory items yet</h3>
              <p className="text-gray-600 mb-4">Start building your warehouse inventory by adding your first stock item.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-offwhite">
                  <tr>
                    <th 
                      className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Item
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('stock')}
                    >
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center gap-1">
                        Value
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="responsive-button text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-offwhite divide-y divide-amber-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-beige">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="responsive-text font-medium text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="responsive-text text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.category === 'food_grade' ? 'bg-green-100 text-green-800' :
                          item.category === 'raw_materials' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'packaging' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.currentStock} {item.unit}</div>
                          <div className="text-xs text-gray-500">Reorder: {item.reorderPoint}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">${(item.currentStock * item.costPerUnit).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">@ ${item.costPerUnit.toFixed(2)}/{item.unit}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap responsive-text text-gray-500">
                        {item.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.currentStock > item.reorderPoint
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.currentStock > item.reorderPoint ? 'In Stock' : 'Reorder Needed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap responsive-text font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStockAdjustment(item)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Adjust stock"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems > 0 && (
          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <h4 className="responsive-text font-medium text-orange-800">
                  Reorder Alert
                </h4>
                <p className="text-sm text-orange-700 mt-1">
                  You have {lowStockItems} item{lowStockItems !== 1 ? 's' : ''} that need{lowStockItems !== 1 ? '' : 's'} reordering.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Stock Adjustment Modal */}
        {showStockAdjustment && selectedItemForAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
                <button
                  onClick={() => {
                    setShowStockAdjustment(false);
                    setSelectedItemForAdjustment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Adjusting stock for: <span className="font-medium">{selectedItemForAdjustment.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current stock: <span className="font-medium">{selectedItemForAdjustment.currentStock} {selectedItemForAdjustment.unit}</span>
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const adjustment = parseInt(formData.get('adjustment') as string);
                const reason = formData.get('reason') as string;
                const notes = formData.get('notes') as string;
                
                if (adjustment && reason) {
                  handleAdjustStock(adjustment, reason, notes);
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Amount
                  </label>
                  <input
                    type="number"
                    name="adjustment"
                    required
                    placeholder="Enter positive or negative number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use positive numbers to add stock, negative to remove
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    name="reason"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select reason for stock adjustment"
                  >
                    <option value="">Select a reason</option>
                    <option value="received_shipment">Received Shipment</option>
                    <option value="sold_product">Sold Product</option>
                    <option value="waste_damage">Waste/Damage</option>
                    <option value="inventory_count">Inventory Count</option>
                    <option value="theft_loss">Theft/Loss</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStockAdjustment(false);
                      setSelectedItemForAdjustment(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjustStockMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {adjustStockMutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Insights Dashboard */}
        <AIInsightsDashboard
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
        />

        {/* B2B Network Dashboard */}
        <B2BNetworkDashboard
          isOpen={showB2BNetwork}
          onClose={() => setShowB2BNetwork(false)}
        />

        {/* AI Receipt Parser Dashboard */}
        <AIReceiptParserDashboard
          isOpen={showAIReceiptParser}
          onClose={() => setShowAIReceiptParser(false)}
        />

        {/* Unit Converter Dashboard */}
        <UnitConverterDashboard
          isOpen={showUnitConverter}
          onClose={() => setShowUnitConverter(false)}
        />

        {/* Advanced Inventory Dashboard */}
        <AdvancedInventoryDashboard
          isOpen={showAdvancedInventory}
          onClose={() => setShowAdvancedInventory(false)}
        />
      </div>
    </VendorDashboardLayout>
  );
} 
