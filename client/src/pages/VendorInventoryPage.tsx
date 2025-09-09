import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import AdvancedInventoryDashboard from '../components/advanced-inventory/AdvancedInventoryDashboard';
import InventoryAlertBar from '../components/inventory/InventoryAlertBar';
import InventoryItemCard from '../components/inventory/InventoryItemCard';
import PageAIInsights from '../components/inventory/PageAIInsights';
import { 
  calculateInventoryAlerts, 
  generateAlertItems,
  type AlertItem 
} from '../utils/inventoryAlerts';
import type { InventoryItem, CreateInventoryItemData, AIInsight } from '../types/inventory';
import { AppIcon } from '@/components/ui/AppIcon';

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
  }>;
}

const LOW_STOCK_THRESHOLD = 10; // You can adjust this threshold

const VendorInventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [showAdvancedInventory, setShowAdvancedInventory] = useState(false);
  const [showUnitConverter, setShowUnitConverter] = useState(false);
  const [showAIReceiptParser, setShowAIReceiptParser] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showB2BNetwork, setShowB2BNetwork] = useState(false);

  const queryClient = useQueryClient();
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/inventory/analytics');
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return null;
      }
    },
    enabled: showAnalytics,
  });

  // Fetch AI insights
  const { data: aiInsightsData, isLoading: aiInsightsLoading } = useQuery({
    queryKey: ['ai-insights-inventory'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/ai/insights/inventory');
        return response.data;
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        return [];
      }
    },
  });

  const inventoryItems = inventoryData?.items || [];
  const aiInsights = aiInsightsData || [];

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateInventoryItemData) => {
      const response = await axios.post('/api/inventory', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-analytics'] });
      setShowAddItemModal(false);
      reset();
      toast.success('Item added successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
      const response = await axios.put(`/api/inventory/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-analytics'] });
      setShowEditItemModal(false);
      setEditingItem(null);
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-analytics'] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });

  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ id, adjustment, reason }: { id: string; adjustment: number; reason: string }) => {
      const response = await axios.post(`/api/inventory/${id}/adjust`, { adjustment, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-analytics'] });
      toast.success('Stock adjusted successfully!');
    },
    onError: (error: any) => {
      console.error('Error adjusting stock:', error);
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    },
  });

  const onSubmit = (data: CreateInventoryItemData) => {
      createItemMutation.mutate(data);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleAdjustStock = (id: string, adjustment: number, reason: string) => {
    adjustStockMutation.mutate({ id, adjustment, reason });
  };

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  // Filter insights to show only non-dismissed ones
  const filteredInsights = useMemo(() => {
    return aiInsights.filter(insight => !dismissedInsights.has(insight.id));
  }, [aiInsights, dismissedInsights]);

  // Export functionality
  const handleExport = (format: 'json' | 'csv' | 'pdf' | 'xlsx') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(inventoryItems, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // For PDF and XLSX, we'll show a toast for now
      toast.success(`${format.toUpperCase()} export coming soon!`);
    }
    
    setShowExportDropdown(false);
    toast.success(`Inventory exported as ${format.toUpperCase()} successfully!`);
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return inventoryItems
    .filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by name alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  // Calculate summary statistics
  const availableItems = inventoryItems.filter(i => i.isAvailable).length;
  const lowStockItems = analytics?.lowStockCount || inventoryItems.filter(i => i.currentStock <= i.reorderPoint).length;
  const totalValue = analytics?.totalValue || inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(inventoryItems.map(item => item.category))];
    return cats.sort();
  }, [inventoryItems]);

  if (isLoading) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory...</p>
            </div>
          </div>
        </div>
      </VendorDashboardLayout>
    );
  }

  if (error) {
    return (
      <VendorDashboardLayout>
        <div className="py-8 bg-white min-h-screen">
          <div className="container-responsive">
          <div className="text-center">
            <AppIcon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600">Failed to load your ingredients. Please try again.</p>
            </div>
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
            <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
                <p className="text-sm text-gray-600">Currently viewing: <span className="text-green-600 font-medium">Inventory</span></p>
            </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Inventory
                </button>
              </div>
            </div>

          {/* Motivational Quote */}
          <MotivationalQuote 
            quote="Success is not final, failure is not fatal: it is the courage to continue that counts." 
            author="Winston Churchill" 
          />

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Overview</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">📦</span>
              </div>
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
              </div>
            </div>
          </div>

              <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">⚠️</span>
                    </div>
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </div>

              <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">💰</span>
                    </div>
              </div>
              <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

            {/* AI Insights */}
            {filteredInsights.length > 0 && (
              <div className="mb-8">
        <PageAIInsights
          insights={aiInsights.filter(insight => !dismissedInsights.has(insight.id))}
          onDismiss={handleDismissInsight}
                />
                </div>
              )}

            {/* Inventory Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No inventory items found.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <InventoryItemCard
                    key={item.id}
                    item={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onAdjustStock={handleAdjustStock}
                  />
                ))}
                                </div>
                              )}
                            </div>
        </div>

          {/* Financial Data Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
        </div>
            <div>
              <p className="font-medium text-yellow-800">Inventory Data Disclaimer</p>
              <p className="text-sm text-yellow-700">
                All inventory data displayed is for informational purposes only. Users are responsible for verifying the accuracy and security of their inventory information. This dashboard does not constitute financial advice.
                </p>
              </div>
                </div>
                </div>
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorInventoryPage;