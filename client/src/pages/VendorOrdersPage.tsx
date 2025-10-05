import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, 
  Search, 
  Download, 
  Bell, 
  Eye, 
  Edit, 
  Clock,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  Grid,
  List,
  Kanban,
  ChefHat,
  Layers
} from 'lucide-react';
import VendorDashboardLayout from '../layouts/VendorDashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import SystemMessagesDrawer from '../components/inventory/SystemMessagesDrawer';
import AIInsightsDrawer from '../components/inventory/AIInsightsDrawer';

// Types
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  phone?: string;
  status: string;
  priority: string;
  source?: string;
  salesWindowId?: string;
  createdAt: string;
  expectedAt?: string;
  dueAt?: string;
  paymentStatus?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
  station?: string;
  tags?: string[];
  total: number;
  orderItems: OrderItem[];
  salesWindow?: {
    id: string;
    name: string;
  };
  timeline?: OrderTimeline[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  status: string;
  madeQty: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface OrderTimeline {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt: string;
}



type ViewMode = 'list' | 'tracker' | 'board' | 'calendar' | 'kds' | 'batching';

const VendorOrdersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', { searchQuery, statusFilter, priorityFilter, viewMode }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      params.append('view', viewMode);

      const response = await fetch(`/api/vendor/orders?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  // Fetch AI insights
  const { data: aiInsights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['ai-orders-insights'],
    queryFn: async () => {
      const response = await fetch('/api/ai/insights/orders?range=7d', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch AI insights');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Bulk status update mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ orderIds, status }: { orderIds: string[]; status: string }) => {
      const response = await fetch('/api/vendor/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: orderIds, status }),
      });
      if (!response.ok) throw new Error('Failed to update orders');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Orders updated successfully');
      setSelectedOrders([]);
    },
    onError: () => {
      toast.error('Failed to update orders');
    },
  });

  const orders = ordersData?.orders || [];
  const stats = ordersData?.stats || {};

  // Calculate summary stats
  const summaryStats = {
    total: orders.length,
    dueToday: orders.filter(order => {
      if (!order.dueAt) return false;
      const today = new Date().toDateString();
      return new Date(order.dueAt).toDateString() === today;
    }).length,
    delivered: stats.DELIVERED?.count || 0,
    finished: (stats.DELIVERED?.count || 0) + (stats.PICKED_UP?.count || 0),
    revenue: Number(Object.values(stats).reduce((sum: number, stat: { total?: number }) => sum + (stat.total || 0), 0)),
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PRODUCTION: 'bg-orange-100 text-orange-800',
      READY: 'bg-green-100 text-green-800',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      PICKED_UP: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      RUSH: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }
    bulkStatusMutation.mutate({ orderIds: selectedOrders, status });
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

    return (
    <VendorDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {summaryStats.total} Total
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowSystemMessages(true)}
                  className="relative text-xs px-2 py-1"
                >
                  <Bell className="h-4 w-4" />
                  {aiInsights?.summary?.rushCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowAIInsights(true)}
                  className="text-xs px-2 py-1"
                >
                  <Eye className="h-4 w-4" />
                  AI Insights
                </Button>
                
                <Button className="text-xs px-2 py-1">
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* KPI Tiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
                </div>
              <Package className="h-8 w-8 text-blue-600" />
              </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.dueToday}</p>
                </div>
              <Clock className="h-8 w-8 text-orange-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.delivered}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finished</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.finished}</p>
                </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
                </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${summaryStats.revenue.toFixed(2)}</p>
                </div>
              <Package className="h-8 w-8 text-green-600" />
                </div>
          </Card>
          </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                title="Filter by priority"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="RUSH">Rush</option>
              </select>
                      </div>
                      
              <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('list')}
                  className="text-xs px-2 py-1"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tracker' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('tracker')}
                  className="text-xs px-2 py-1"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('board')}
                  className="text-xs px-2 py-1"
                >
                  <Kanban className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('calendar')}
                  className="text-xs px-2 py-1"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kds' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('kds')}
                  className="text-xs px-2 py-1"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'batching' ? 'primary' : 'secondary'}
                  onClick={() => setViewMode('batching')}
                  className="text-xs px-2 py-1"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="secondary" className="text-xs px-2 py-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                  className="text-xs px-2 py-1"
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('IN_PRODUCTION')}
                  className="text-xs px-2 py-1"
                >
                  Start Production
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleBulkStatusUpdate('READY')}
                  className="text-xs px-2 py-1"
                >
                  Mark Ready
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrders([])}
                  className="text-xs px-2 py-1"
                >
                  Clear
                </Button>
              </div>
            </div>
              </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === orders.length && orders.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300"
                                title="Select all orders"
                              />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingOrders ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            Loading orders...
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                                className="rounded border-gray-300"
                                title="Select order"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.orderNumber}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.customerEmail}
                                </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.dueAt ? new Date(order.dueAt).toLocaleDateString() : 'N/A'}
                              </div>
                              {order.dueAt && new Date(order.dueAt) < new Date() && (
                                <div className="text-xs text-red-600">Overdue</div>
                              )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.orderItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.total.toFixed(2)}
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" className="text-xs px-2 py-1">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                      </td>
                    </tr>
                        ))
                      )}
              </tbody>
            </table>
            </div>
              </div>
            )}

            {viewMode === 'tracker' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Tracker</h3>
                <p className="text-gray-500">Tracker view coming soon...</p>
        </div>
      )}

            {viewMode === 'board' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kanban Board</h3>
                <p className="text-gray-500">Board view coming soon...</p>
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar View</h3>
                <p className="text-gray-500">Calendar view coming soon...</p>
              </div>
            )}

            {viewMode === 'kds' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kitchen Display System</h3>
                <p className="text-gray-500">KDS view coming soon...</p>
      </div>
            )}

            {viewMode === 'batching' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Batching View</h3>
                <p className="text-gray-500">Batching view coming soon...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
            </div>
            
        {/* System Messages Drawer */}
        <SystemMessagesDrawer
          isOpen={showSystemMessages}
          onClose={() => setShowSystemMessages(false)}
          scope="orders"
        />

        {/* AI Insights Drawer */}
        <AIInsightsDrawer
          isOpen={showAIInsights}
          onClose={() => setShowAIInsights(false)}
          insights={aiInsights || { rush: [], batching: [], shortages: [], prepPlan: [] }}
          isLoading={isLoadingInsights}
        />
      </div>
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage; 