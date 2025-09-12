import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  BarChart3,
  FileText,
  Tag,
  CreditCard
} from 'lucide-react';
import { Link } from 'wouter';
import VendorDashboardLayout from '@/layouts/VendorDashboardLayout';
import OrderTracker from '../components/orders/OrderTracker';
import OrderKanbanBoard from '../components/orders/OrderKanbanBoard';
import OrderAnalytics from '../components/orders/OrderAnalytics';
import SimpleLabelPrintModal from '../components/labels/SimpleLabelPrintModal';
import OrderListPrintModal from '../components/orders/OrderListPrintModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';

// Types
interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  productionStartDate?: string;
  productionEndDate?: string;
  assignedTo?: string;
  tags: string[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  status: 'pending' | 'in_production' | 'completed' | 'cancelled';
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Dummy data
const dummyOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2025-001',
    customerId: 'cust-1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@restaurantgroup.com',
    customerPhone: '(555) 123-4567',
    status: 'in_production',
    priority: 'high',
    totalAmount: 1250.00,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Custom Logo Aprons',
        quantity: 50,
        unitPrice: 15.00,
        totalPrice: 750.00,
        specifications: 'Red aprons with white logo, size M-L',
        status: 'in_production'
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Chef Hats',
        quantity: 25,
        unitPrice: 20.00,
        totalPrice: 500.00,
        specifications: 'White chef hats with embroidered logo',
        status: 'pending'
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    notes: 'Rush order for grand opening event',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
    expectedDeliveryDate: '2025-02-01',
    productionStartDate: '2025-01-18T09:00:00Z',
    assignedTo: 'Production Team A',
    tags: ['rush', 'restaurant', 'grand-opening']
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2025-002',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@deliveryapp.com',
    customerPhone: '(555) 987-6543',
    status: 'confirmed',
    priority: 'medium',
    totalAmount: 850.00,
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        productName: 'Delivery Bags',
        quantity: 100,
        unitPrice: 8.50,
        totalPrice: 850.00,
        specifications: 'Insulated delivery bags with company logo',
        status: 'pending'
      }
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    billingAddress: {
      street: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    notes: 'Standard delivery timeline',
    createdAt: '2025-01-18T14:20:00Z',
    updatedAt: '2025-01-18T14:20:00Z',
    expectedDeliveryDate: '2025-02-15',
    assignedTo: 'Production Team B',
    tags: ['delivery', 'bags', 'standard']
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2025-003',
    customerId: 'cust-3',
    customerName: 'Emma Rodriguez',
    customerEmail: 'emma@boutiquestyle.com',
    customerPhone: '(555) 456-7890',
    status: 'ready_for_pickup',
    priority: 'low',
    totalAmount: 320.00,
    items: [
      {
        id: 'item-4',
        productId: 'prod-4',
        productName: 'Custom T-Shirts',
        quantity: 20,
        unitPrice: 16.00,
        totalPrice: 320.00,
        specifications: 'Black t-shirts with pink logo, sizes S-XL',
        status: 'completed'
      }
    ],
    shippingAddress: {
      street: '789 Pine St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    billingAddress: {
      street: '789 Pine St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    notes: 'Customer prefers pickup over shipping',
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2025-01-22T16:45:00Z',
    expectedDeliveryDate: '2025-01-25',
    actualDeliveryDate: '2025-01-22T16:45:00Z',
    productionStartDate: '2025-01-12T08:00:00Z',
    productionEndDate: '2025-01-20T17:00:00Z',
    assignedTo: 'Production Team A',
    tags: ['t-shirts', 'pickup', 'completed']
  }
];

const VendorOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'expectedDeliveryDate' | 'totalAmount' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tracker' | 'kanban' | 'analytics'>('tracker');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showLabelPrinting, setShowLabelPrinting] = useState(false);
  const [showLabelTemplateManager, setShowLabelTemplateManager] = useState(false);
  const [showOrderListPrinting, setShowOrderListPrinting] = useState(false);
  const [selectedOrdersForLabels, setSelectedOrdersForLabels] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Mock data - in real app, this would come from API
  const { data: orders = dummyOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => Promise.resolve(dummyOrders),
  });

  const queryClient = useQueryClient();

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'expectedDeliveryDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Status configuration
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    in_production: { label: 'In Production', color: 'bg-orange-100 text-orange-800', icon: Package },
    ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-purple-100 text-purple-800', icon: Truck },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handlePrintLabels = () => {
    if (selectedOrders.length > 0) {
      setSelectedOrdersForLabels(selectedOrders);
    setShowLabelPrinting(true);
    } else {
      // If no orders selected, show all orders
      setSelectedOrdersForLabels(filteredOrders.map(order => order.id));
      setShowLabelPrinting(true);
    }
  };

  const handleManageTemplates = () => {
    alert('Label template management will be available in a future update. For now, you can use the basic label printing feature.');
  };

  const handlePrintSelectedLabels = (orderIds: string[]) => {
    setSelectedOrdersForLabels(orderIds);
    setShowLabelPrinting(true);
  };

  const handlePrintOrderList = () => {
    setShowOrderListPrinting(true);
  };

  const handleStatusUpdate = (orderId: string, status: string) => {
    // In a real app, this would update the backend
    console.log(`Updating order ${orderId} status to ${status}`);
    
    // Update the order status in the local state
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: status as any, updatedAt: new Date().toISOString() }
          : order
      );
      console.log('Updated orders:', updatedOrders.find(o => o.id === orderId));
      return updatedOrders;
    });
  };

  const handleAssign = (orderId: string, assignedTo: string) => {
    // In a real app, this would update the backend
    console.log(`Assigning order ${orderId} to ${assignedTo}`);
  };

  const handleOrderEdit = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleNewOrder = () => {
    // Create a new empty order object for editing
    const newOrder: Order = {
      id: 'new',
      orderNumber: '',
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'pending',
      priority: 'medium',
      totalAmount: 0,
      items: [],
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedDeliveryDate: '',
      productionStartDate: '',
      assignedTo: '',
      tags: []
    };
    setSelectedOrder(newOrder);
  };

  const handleOrderSave = (order: Order) => {
    // In a real app, this would save to the backend
    console.log('Saving new order:', order);
    // For now, just close the modal
    setSelectedOrder(null);
  };

  const handleOrderDuplicate = (order: Order) => {
    // Create a duplicate order with a new ID and order number
    const duplicatedOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Clear delivery dates for the duplicate
      expectedDeliveryDate: '',
      actualDeliveryDate: undefined,
      productionStartDate: undefined,
      productionEndDate: undefined,
    };
    
    // Open the modal with the duplicated order for editing
    setSelectedOrder(duplicatedOrder);
    console.log('Duplicating order:', duplicatedOrder);
  };

  const handleOrderDelete = (orderId: string) => {
    // In a real app, this would delete from the backend
    console.log(`Deleting order ${orderId}`);
  };

  if (isLoading) {
    return (
      <VendorDashboardLayout>
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
      </VendorDashboardLayout>
    );
  }

  return (
    <VendorDashboardLayout>
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-2">
                {viewMode === 'gantt' 
                  ? 'Visual timeline showing order progress from creation to delivery' 
                  : 'Track and manage customer orders from production to delivery'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleNewOrder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Order
              </button>
              <button 
                onClick={handlePrintLabels}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Print Labels"
              >
                <Printer className="h-4 w-4" />
                Print Labels
              </button>
              <button 
                onClick={handlePrintOrderList}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Print Order List"
              >
                <Download className="h-4 w-4" />
                Print List
              </button>
              <button 
                onClick={handleManageTemplates}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Manage Templates"
              >
                <FileText className="h-4 w-4" />
                Templates
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button 
                onClick={() => setShowCreditsModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Credits & Discounts
              </button>
              </div>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Production</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'in_production').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready for Pickup</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ready_for_pickup').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by priority"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
                      </div>
                      
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
                      <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="List view"
                >
                  <FileText className="h-4 w-4 inline mr-1" />
                  List
                      </button>
                      <button
                  onClick={() => setViewMode('tracker')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'tracker' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Customizable order tracker - Drag and drop workflow management"
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Tracker
                      </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Kanban board view"
                >
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Board
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'analytics' ? 'bg-[#5B6E02] text-white shadow-md' : 'text-gray-600 hover:text-[#5B6E02] hover:bg-gray-100'}`}
                  title="Analytics view"
                >
                  <Package className="h-4 w-4 inline mr-1" />
                  Analytics
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title="Sort by field"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="expectedDeliveryDate">Delivery Date</option>
                  <option value="totalAmount">Total Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Content */}
        {viewMode === 'tracker' ? (
          <OrderTracker
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onOrderEdit={handleOrderEdit}
            onOrderDuplicate={handleOrderDuplicate}
            onOrderPrint={(order) => handlePrintSelectedLabels([order.id])}
            onStatusUpdate={handleStatusUpdate}
          />
        ) : viewMode === 'kanban' ? (
          <OrderKanbanBoard
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onStatusUpdate={handleStatusUpdate}
            onOrderEdit={handleOrderEdit}
            onOrderDelete={handleOrderDelete}
          />
        ) : viewMode === 'analytics' ? (
          <OrderAnalytics
            orders={orders}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        ) : (
          /* Orders List */
          <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Orders ({filteredOrders.length})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  title="Select all orders"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
              </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" title="Select all orders" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
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
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title={`Select order ${order.orderNumber}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[order.priority].color}`}>
                          {priorityConfig[order.priority].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.expectedDeliveryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleOrderClick(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOrderEdit(order)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handlePrintLabels()}
                            className="text-gray-600 hover:text-gray-900"
                            title="Print Labels"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="More options">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
              </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrintOrderList}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                    Print Order List
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Update Status
                </button>
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                    Export
                </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}


        {/* Modals */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onSave={handleOrderSave}
            onStatusUpdate={handleStatusUpdate}
            onAssign={handleAssign}
          />
        )}

        {/* {showLabelPrinting && (
          <LabelPrinting
            orders={orders.filter(order => selectedOrders.includes(order.id))}
            onClose={() => setShowLabelPrinting(false)}
          />
        )} */}

        {/* Credits & Discounts Modal */}
        {showCreditsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Customer Credits & Discounts</h3>
                  <button
                    onClick={() => setShowCreditsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Close credits modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select customer">
                      <option value="">Choose a customer...</option>
                      <option value="cust-1">John Smith (john.smith@email.com)</option>
                      <option value="cust-2">Sarah Johnson (sarah.j@email.com)</option>
                      <option value="cust-3">Mike Wilson (mike.wilson@email.com)</option>
                      <option value="cust-4">Emily Davis (emily.davis@email.com)</option>
                      <option value="cust-5">David Brown (david.brown@email.com)</option>
                    </select>
                  </div>

                  {/* Current Credit Balance */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Current Credit Balance</h4>
                    <p className="text-2xl font-bold text-green-600">$0.00</p>
                    <p className="text-sm text-gray-600">Available for this customer</p>
                  </div>

                  {/* Add Credits */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Add Credits</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reason</label>
                        <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select credit reason">
                          <option value="">Select reason...</option>
                          <option value="refund">Refund</option>
                          <option value="compensation">Compensation</option>
                          <option value="promotion">Promotion</option>
                          <option value="loyalty">Loyalty Reward</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          placeholder="Optional notes about this credit..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Discount Codes */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Create Discount Code</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Code</label>
                        <input
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter discount code"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" title="Select discount type">
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Value</label>
                          <input
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expiration Date</label>
                        <input
                          type="date"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          title="Select expiration date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCreditsModal(false);
                    // In a real app, this would apply credits/discounts
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Apply Credits/Discounts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Label Print Modal */}
        <SimpleLabelPrintModal
          isOpen={showLabelPrinting}
          onClose={() => setShowLabelPrinting(false)}
          orders={orders.filter(order => selectedOrdersForLabels.includes(order.id))}
        />

        {/* Label Template Manager Modal */}
        {/* <LabelTemplateManager
          isOpen={showLabelTemplateManager}
          onClose={() => setShowLabelTemplateManager(false)}
          onSelectTemplate={(template) => {
            setShowLabelTemplateManager(false);
            // Could open print modal with selected template
          }}
        /> */}

        {/* Order List Print Modal */}
        <OrderListPrintModal
          isOpen={showOrderListPrinting}
          onClose={() => setShowOrderListPrinting(false)}
          orders={orders}
          selectedOrderIds={selectedOrders}
        />
      </div>
    </div>
    </VendorDashboardLayout>
  );
};

export default VendorOrdersPage; 