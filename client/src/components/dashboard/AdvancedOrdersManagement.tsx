import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Phone,
  Mail,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  deliveryDate?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes: string;
  customerRating?: number;
  customerFeedback?: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  status: 'pending' | 'ready' | 'packed';
}

const AdvancedOrdersManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data - replace with actual API calls
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '+1-555-0123',
      status: 'confirmed',
      total: 89.99,
      items: [
        { id: '1', productName: 'Artisan Bread', quantity: 2, price: 44.99, total: 89.98, status: 'ready' }
      ],
      createdAt: '2025-08-27T10:00:00Z',
      updatedAt: '2025-08-27T14:30:00Z',
      shippingAddress: '123 Main St, City, State 12345',
      deliveryDate: '2025-08-28',
      paymentStatus: 'paid',
      priority: 'high',
      tags: ['vip', 'repeat-customer'],
      notes: 'Customer prefers afternoon delivery',
      customerRating: 5,
      customerFeedback: 'Excellent service and quality!'
    },
    // Add more mock orders...
  ];

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      
      return matchesStatus && matchesSearch && matchesPriority;
    });
  }, [mockOrders, selectedStatus, searchTerm, priorityFilter]);

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    mockOrders.forEach(order => counts[order.status]++);
    return counts;
  }, [mockOrders]);

  const totalRevenue = useMemo(() => {
    return mockOrders.reduce((sum, order) => sum + order.total, 0);
  }, [mockOrders]);

  const averageOrderValue = useMemo(() => {
    return mockOrders.length > 0 ? totalRevenue / mockOrders.length : 0;
  }, [totalRevenue, mockOrders]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage customer orders, track fulfillment, and monitor performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-primary">
            <Package className="h-4 w-4 mr-2" />
            New Order
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
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{mockOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(mockOrders.map(o => o.customerEmail)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order Status Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {count}
                </div>
                <p className="mt-1 text-sm text-gray-600 capitalize">{status}</p>
              </div>
            ))}
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
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <PieChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.items.length} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
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
    </div>
  );
};

export default AdvancedOrdersManagement;
