import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, Upload, Download, Filter, Search, Grid, List, AlertTriangle, Clock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

// Modals
import AddInventoryItemModal from '../components/inventory/AddInventoryItemModal';
import ReceiveInventoryModal from '../components/inventory/ReceiveInventoryModal';
import AdjustInventoryModal from '../components/inventory/AdjustInventoryModal';
import MovementHistoryModal from '../components/inventory/MovementHistoryModal';
import PriceWatchModal from '../components/inventory/PriceWatchModal';

// Drawers
import AIInsightsDrawer from '../components/inventory/AIInsightsDrawer';
import SystemMessagesDrawer from '../components/inventory/SystemMessagesDrawer';
import ReceiptParserModal from '../components/inventory/ReceiptParserModal';

// Types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_qty: number;
  reorder_point: number;
  preferred_qty: number;
  avg_cost: number;
  last_cost: number;
  supplier_name?: string;
  location?: string;
  batch_number?: string;
  expiry_date?: string;
  tags: string[];
  priceWatches: any[];
  movements: any[];
}

interface InventoryKPIs {
  totalItems: number;
  lowStockCount: number;
  expiredCount: number;
  totalValue: number;
}

interface InventoryInsights {
  restockAlerts: any[];
  expiredItems: any[];
  expiringSoon: any[];
  priceWatchHits: any[];
  seasonalForecasts: any[];
  upcomingCommitments: any[];
}

const InventoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showPriceWatchModal, setShowPriceWatchModal] = useState(false);
  const [showReceiptParser, setShowReceiptParser] = useState(false);
  
  // Drawer states
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);
  const [showMessagesDrawer, setShowMessagesDrawer] = useState(false);
  
  // Selected items
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch inventory items
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ['inventory', searchQuery, selectedCategory, selectedStatus, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });
      
      const response = await fetch(`/api/vendor/inventory?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      return response.json();
    }
  });

  // Fetch insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['inventory-insights'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/inventory/insights', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      return response.json();
    }
  });

  // Fetch system messages
  const { data: messagesData } = useQuery({
    queryKey: ['system-messages', 'inventory'],
    queryFn: async () => {
      const response = await fetch('/api/vendor/system-messages?scope=inventory&unreadOnly=true', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch system messages');
      }
      
      return response.json();
    }
  });

  // Mutations
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor/inventory/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const togglePriceWatchMutation = useMutation({
    mutationFn: async ({ itemId, active }: { itemId: string; active: boolean }) => {
      if (active) {
        // Create price watch
        const response = await fetch('/api/vendor/inventory/price-watch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            inventoryItemId: itemId,
            target_unit_cost: 0, // Will be set in modal
            source: 'B2B'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create price watch');
        }
        
        return response.json();
      } else {
        // Stop price watch
        const response = await fetch(`/api/vendor/inventory/price-watch/${itemId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to stop price watch');
        }
        
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-insights'] });
      toast.success('Price watch updated');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Handlers
  const handleDeleteItem = (item: InventoryItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const handleTogglePriceWatch = (item: InventoryItem) => {
    const hasWatch = item.priceWatches.length > 0;
    togglePriceWatchMutation.mutate({ 
      itemId: item.id, 
      active: !hasWatch 
    });
  };

  const handleReceiveItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowReceiveModal(true);
  };

  const handleAdjustItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustModal(true);
  };

  const handleViewMovements = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowMovementModal(true);
  };

  const handlePriceWatch = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowPriceWatchModal(true);
  };

  // Get item status
  const getItemStatus = (item: InventoryItem) => {
    const statuses = [];
    
    if (item.current_qty <= item.reorder_point) {
      statuses.push({ type: 'low_stock', label: 'LOW STOCK', color: 'red' });
    }
    
    if (item.expiry_date && new Date(item.expiry_date) < new Date()) {
      statuses.push({ type: 'expired', label: 'EXPIRED', color: 'red' });
    } else if (item.expiry_date) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 7) {
        statuses.push({ type: 'expiring', label: 'EXPIRING SOON', color: 'yellow' });
      }
    }
    
    if (item.priceWatches.length > 0) {
      statuses.push({ type: 'watching', label: 'WATCHING', color: 'blue' });
    }
    
    return statuses;
  };

  // Render item card
  const renderItemCard = (item: InventoryItem) => {
    const statuses = getItemStatus(item);
    const totalValue = item.current_qty * item.avg_cost;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category} • {item.unit}</p>
          </div>
          <div className="flex gap-1">
            {statuses.map((status) => (
              <Badge key={status.type} variant={status.color as any} size="sm">
                {status.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</p>
            <p className="text-lg font-semibold text-gray-900">{item.current_qty}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Reorder Point</p>
            <p className="text-lg font-semibold text-gray-900">{item.reorder_point}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Cost</p>
            <p className="text-lg font-semibold text-gray-900">${item.avg_cost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
            <p className="text-lg font-semibold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
        </div>
        
        {item.supplier_name && (
          <p className="text-sm text-gray-600 mb-4">Supplier: {item.supplier_name}</p>
        )}
        
        {item.location && (
          <p className="text-sm text-gray-600 mb-4">Location: {item.location}</p>
        )}
        
        {item.expiry_date && (
          <p className="text-sm text-gray-600 mb-4">
            Expires: {new Date(item.expiry_date).toLocaleDateString()}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReceiveItem(item)}
            className="flex-1"
          >
            Receive
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAdjustItem(item)}
            className="flex-1"
          >
            Adjust
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewMovements(item)}
          >
            History
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePriceWatch(item)}
          >
            {item.priceWatches.length > 0 ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </motion.div>
    );
  };

  // Render item row (list view)
  const renderItemRow = (item: InventoryItem) => {
    const statuses = getItemStatus(item);
    const totalValue = item.current_qty * item.avg_cost;
    
    return (
      <motion.tr
        key={item.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="border-b border-gray-100 hover:bg-gray-50"
      >
        <td className="px-6 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category} • {item.unit}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-1">
            {statuses.map((status) => (
              <Badge key={status.type} variant={status.color as any} size="sm">
                {status.label}
              </Badge>
            ))}
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-semibold">{item.current_qty}</span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-semibold">{item.reorder_point}</span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-semibold">${item.avg_cost.toFixed(2)}</span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="font-semibold">${totalValue.toFixed(2)}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReceiveItem(item)}
            >
              Receive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAdjustItem(item)}
            >
              Adjust
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewMovements(item)}
            >
              History
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePriceWatch(item)}
            >
              {item.priceWatches.length > 0 ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </td>
      </motion.tr>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-4">There was an error loading your inventory data.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const kpis: InventoryKPIs = inventoryData?.kpis || {
    totalItems: 0,
    lowStockCount: 0,
    expiredCount: 0,
    totalValue: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Manage your inventory with AI-powered insights</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMessagesDrawer(true)}
                className="relative"
              >
                <Bell size={20} />
                {messagesData?.unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {messagesData.unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInsightsDrawer(true)}
              >
                AI Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReceiptParser(true)}
              >
                <Upload size={20} />
                Scan Receipt
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-red hover:bg-brand-red/90"
              >
                <Plus size={20} />
                Add Item
              </Button>
            </div>
          </div>
          
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.totalItems}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📦</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{kpis.lowStockCount}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{kpis.expiredCount}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">${kpis.totalValue.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">💰</span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="All Categories"
            >
              <option value="">All Categories</option>
              <option value="FOOD_GRADE">Food Grade</option>
              <option value="PACKAGING">Packaging</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="CLEANING">Cleaning</option>
            </Select>
            
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder="All Status"
            >
              <option value="">All Status</option>
              <option value="low_stock">Low Stock</option>
              <option value="expired">Expired</option>
              <option value="on_watchlist">On Watchlist</option>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {inventoryData?.items?.map(renderItemCard)}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Qty
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Point
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {inventoryData?.items?.map(renderItemRow)}
                </AnimatePresence>
              </tbody>
            </table>
          </Card>
        )}
        
        {/* Pagination */}
        {inventoryData?.pagination && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {((inventoryData.pagination.page - 1) * inventoryData.pagination.pageSize) + 1} to{' '}
              {Math.min(inventoryData.pagination.page * inventoryData.pagination.pageSize, inventoryData.pagination.total)} of{' '}
              {inventoryData.pagination.total} items
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={inventoryData.pagination.page === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={inventoryData.pagination.page === inventoryData.pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AddInventoryItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }}
      />
      
      <ReceiveInventoryModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        item={selectedItem}
        onSuccess={() => {
          setShowReceiveModal(false);
          setSelectedItem(null);
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }}
      />
      
      <AdjustInventoryModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        item={selectedItem}
        onSuccess={() => {
          setShowAdjustModal(false);
          setSelectedItem(null);
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }}
      />
      
      <MovementHistoryModal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        item={selectedItem}
      />
      
      <PriceWatchModal
        isOpen={showPriceWatchModal}
        onClose={() => setShowPriceWatchModal(false)}
        item={selectedItem}
        onSuccess={() => {
          setShowPriceWatchModal(false);
          setSelectedItem(null);
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }}
      />
      
      <ReceiptParserModal
        isOpen={showReceiptParser}
        onClose={() => setShowReceiptParser(false)}
        onSuccess={() => {
          setShowReceiptParser(false);
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }}
      />
      
      {/* Drawers */}
      <AIInsightsDrawer
        isOpen={showInsightsDrawer}
        onClose={() => setShowInsightsDrawer(false)}
        insights={insights}
        isLoading={insightsLoading}
      />
      
      <SystemMessagesDrawer
        isOpen={showMessagesDrawer}
        onClose={() => setShowMessagesDrawer(false)}
        scope="inventory"
      />
    </div>
  );
};

export default InventoryManagement;

