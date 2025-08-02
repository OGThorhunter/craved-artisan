import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Package, User, DollarSign, Clock, Filter } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  productName: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  shippingZip: string;
  shippingCity: string;
  shippingState: string;
  items: OrderItem[];
  fulfillmentStatus: string;
  etaLabel: string | null;
}

interface DeliveryBatches {
  batches: Record<string, Order[]>;
  totalOrders: number;
  totalBatches: number;
}

const VendorDeliveryBatchingPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: batchedOrders, isLoading, error } = useQuery<DeliveryBatches>({
    queryKey: ['delivery-batches'],
    queryFn: async () => {
      const res = await fetch('/api/vendor/orders/delivery-batches');
      if (!res.ok) {
        throw new Error('Failed to fetch delivery batches');
      }
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading delivery batches: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!batchedOrders) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">No delivery batches found.</p>
        </div>
      </div>
    );
  }

  // Filter batches based on selected day and search term
  const filteredBatches = Object.entries(batchedOrders.batches).filter(([day, orders]) => {
    const matchesDay = selectedDay === 'all' || day === selectedDay;
    const matchesSearch = searchTerm === '' || orders.some(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingZip.includes(searchTerm)
    );
    return matchesDay && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayColor = (day: string) => {
    switch (day) {
      case 'Monday':
        return 'bg-blue-50 border-blue-200';
      case 'Tuesday':
        return 'bg-purple-50 border-purple-200';
      case 'Wednesday':
        return 'bg-green-50 border-green-200';
      case 'Thursday':
        return 'bg-yellow-50 border-yellow-200';
      case 'Friday':
        return 'bg-orange-50 border-orange-200';
      case 'Saturday':
        return 'bg-pink-50 border-pink-200';
      case 'Sunday':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Delivery Batching Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Organize and manage orders by delivery day for efficient fulfillment
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{batchedOrders.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivery Days</p>
              <p className="text-2xl font-bold text-gray-900">{batchedOrders.totalBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Object.values(batchedOrders.batches)
                  .flat()
                  .reduce((sum, order) => sum + order.total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by customer name, order number, or ZIP code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="md:w-48">
            <label htmlFor="day-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Day
            </label>
            <select
              id="day-filter"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Batches */}
      <div className="space-y-6">
        {filteredBatches.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found matching your criteria.</p>
          </div>
        ) : (
          filteredBatches.map(([day, orders]) => (
            <div key={day} className={`border rounded-lg overflow-hidden ${getDayColor(day)}`}>
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {orders.length} orders
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{order.orderNumber}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          {order.etaLabel && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {order.etaLabel}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{order.shippingCity}, {order.shippingState} ({order.shippingZip})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{order.items.length} items</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => window.open(`/dashboard/vendor/orders/${order.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorDeliveryBatchingPage; 