import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  User,
  MapPin,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  Filter,
  Search,
  ArrowLeft,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface Fulfillment {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  type: 'SHIPPING' | 'PICKUP' | 'DELIVERY';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  etaLabel?: string; // AI-generated label (e.g., "âš¡ Fast Fulfillment", "ðŸ“¦ Standard")
  predictedHours?: number; // AI prediction raw hours
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ShippingAddress {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  fulfillment: Fulfillment;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface UpdateFulfillmentData {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  notes?: string;
}

const VendorOrdersPage = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateFulfillmentData>({
    status: 'PENDING'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/orders');
      return response.data;
    }
  });

  // Fetch order statistics
  const { data: statsData } = useQuery({
    queryKey: ['vendorOrderStats'],
    queryFn: async () => {
      const response = await axios.get('/api/vendor/orders/stats');
      return response.data;
    }
  });

  // Update fulfillment mutation
  const updateFulfillmentMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateFulfillmentData }) => {
      const response = await axios.patch(`/api/vendor/orders/${orderId}/fulfillment`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrderStats'] });
      toast.success('Fulfillment status updated successfully');
      setIsUpdateModalOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error('Error updating fulfillment:', error);
      toast.error('Failed to update fulfillment status');
    }
  });

  const orders: Order[] = ordersData?.orders || [];
  const stats: OrderStats = statsData?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.fulfillment.status === filterStatus;
    const matchesLabel = filterLabel === 'all' || order.fulfillment.etaLabel === filterLabel;
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesLabel && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'FAILED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Truck className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'FAILED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleUpdateFulfillment = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.fulfillment.status,
      trackingNumber: order.fulfillment.trackingNumber || '',
      carrier: order.fulfillment.carrier || '',
      estimatedDelivery: order.fulfillment.estimatedDelivery || '',
      notes: order.fulfillment.notes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = () => {
    if (!selectedOrder) return;
    
    updateFulfillmentMutation.mutate({
      orderId: selectedOrder.id,
      data: updateData
    });
  };

  if (ordersLoading) {
    return (
      <div className="page-container bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="responsive-heading text-gray-900">Order Fulfillment</h1>
          <p className="text-gray-600 mt-2">Manage and track your product orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Total Orders</p>
                <p className="responsive-heading text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Pending</p>
                <p className="responsive-heading text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">In Progress</p>
                <p className="responsive-heading text-gray-900">{stats.inProgressOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Completed</p>
                <p className="responsive-heading text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="responsive-text font-medium text-gray-600">Total Revenue</p>
                <p className="responsive-heading text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="responsive-button border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by fulfillment status"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="FAILED">Failed</option>
              </select>
              <select
                value={filterLabel}
                onChange={(e) => setFilterLabel(e.target.value)}
                className="responsive-button border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by fulfillment label"
              >
                <option value="all">All Labels</option>
                <option value="âš¡ Fast Fulfillment">âš¡ Fast Fulfillment</option>
                <option value="ðŸ“¦ Standard">ðŸ“¦ Standard</option>
                <option value="â³ Delayed">â³ Delayed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="responsive-subheading text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {orders.length === 0 
                  ? "You don't have any orders yet. Orders will appear here when customers purchase your products."
                  : "No orders match your current filters."
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.fulfillment.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.fulfillment.status)}
                            {order.fulfillment.status.replace('_', ' ')}
                          </div>
                        </span>
                        {order.fulfillment.etaLabel && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            {order.fulfillment.etaLabel}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 responsive-text text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {order.customer.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${order.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateFulfillment(order)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Update fulfillment status"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              {item.product.imageUrl ? (
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                              <p className="text-gray-600">Qty: {item.quantity} Ã— ${item.price}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="responsive-text text-gray-500">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="responsive-text text-gray-600">
                        <div className="flex items-start gap-1 mb-1">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.address1}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Info */}
                  {order.fulfillment.trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Tracking:</span>
                        <span className="text-blue-700">{order.fulfillment.trackingNumber}</span>
                        {order.fulfillment.carrier && (
                          <>
                            <span className="text-blue-600">â€¢</span>
                            <span className="text-blue-700">{order.fulfillment.carrier}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="responsive-subheading text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Order Number:</span>
                      <p className="text-gray-900">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOrder.fulfillment.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedOrder.fulfillment.status)}
                            {selectedOrder.fulfillment.status.replace('_', ' ')}
                          </div>
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Order Date:</span>
                      <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Subtotal:</span>
                      <p className="text-gray-900">${selectedOrder.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="responsive-subheading text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedOrder.customer.name}</p>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Email:</span>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    {selectedOrder.customer.phone && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Phone:</span>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{selectedOrder.customer.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="responsive-subheading text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="responsive-text text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${item.price.toFixed(2)} each</p>
                        <p className="responsive-text text-gray-600">Total: ${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mt-8">
                <h3 className="responsive-subheading text-gray-900 mb-4">Shipping Address</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                      <p className="text-gray-600">{selectedOrder.shippingAddress.address1}</p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </p>
                      {selectedOrder.shippingAddress.country && (
                        <p className="text-gray-600">{selectedOrder.shippingAddress.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfillment Details */}
              <div className="mt-8">
                <h3 className="responsive-subheading text-gray-900 mb-4">Fulfillment Details</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedOrder.fulfillment.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedOrder.fulfillment.status)}
                            {selectedOrder.fulfillment.status.replace('_', ' ')}
                          </div>
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="responsive-text font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900">{selectedOrder.fulfillment.type}</p>
                    </div>
                    {selectedOrder.fulfillment.trackingNumber && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Tracking Number:</span>
                        <p className="text-gray-900">{selectedOrder.fulfillment.trackingNumber}</p>
                      </div>
                    )}
                    {selectedOrder.fulfillment.carrier && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Carrier:</span>
                        <p className="text-gray-900">{selectedOrder.fulfillment.carrier}</p>
                      </div>
                    )}
                    {selectedOrder.fulfillment.estimatedDelivery && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Estimated Delivery:</span>
                        <p className="text-gray-900">
                          {new Date(selectedOrder.fulfillment.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedOrder.fulfillment.actualDelivery && (
                      <div>
                        <span className="responsive-text font-medium text-gray-600">Actual Delivery:</span>
                        <p className="text-gray-900">
                          {new Date(selectedOrder.fulfillment.actualDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.fulfillment.notes && (
                    <div className="mt-4">
                      <span className="responsive-text font-medium text-gray-600">Notes:</span>
                      <p className="text-gray-900 mt-1">{selectedOrder.fulfillment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="responsive-button text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateFulfillment(selectedOrder)}
                  className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Fulfillment Modal */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="responsive-subheading text-gray-900">Update Fulfillment Status</h2>
              <p className="text-gray-600 mt-1">Order: {selectedOrder.orderNumber}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Status
                </label>
                                 <select
                   value={updateData.status}
                   onChange={(e) => setUpdateData({ ...updateData, status: e.target.value as any })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   title="Select fulfillment status"
                 >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={updateData.trackingNumber || ''}
                  onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Carrier
                </label>
                <input
                  type="text"
                  value={updateData.carrier || ''}
                  onChange={(e) => setUpdateData({ ...updateData, carrier: e.target.value })}
                  placeholder="e.g., UPS, FedEx, USPS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Estimated Delivery
                </label>
                                 <input
                   type="datetime-local"
                   value={updateData.estimatedDelivery || ''}
                   onChange={(e) => setUpdateData({ ...updateData, estimatedDelivery: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   title="Select estimated delivery date and time"
                 />
              </div>

              <div>
                <label className="block responsive-text font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={updateData.notes || ''}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="responsive-button text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitUpdate}
                  disabled={updateFulfillmentMutation.isPending}
                  className="responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateFulfillmentMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage; 
