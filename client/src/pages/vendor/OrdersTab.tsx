import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpJson } from '@/lib/http';
import { CheckCircle, Clock, Package, Truck, X, Bell } from 'lucide-react';

// Type definitions for callback parameters
type OrderItem = { id: string; productName: string; quantity: number; price: number };
type Fulfillment = { method: string; date: string; location?: { name: string } };
type OrderEvent = { type: string; message?: string; createdAt: string };

interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  status: string;
  total: number;
  createdAt: string;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  fulfillments: Array<{
    id: string;
    method: string;
    date: string;
    location?: { name: string };
  }>;
  events: Array<{
    type: string;
    createdAt: string;
    message?: string;
  }>;
}

export function OrdersTab() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => httpJson.get('/api/vendor/orders'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, message }: { orderId: string; status: string; message?: string }) =>
      httpJson.post(`/api/fulfillment/order/${orderId}/vendor/current/status`, { status, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });

  const markFulfilledMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      httpJson.post(`/api/fulfillment/order/${orderId}/vendor/current/status`, { 
        status: 'fulfilled', 
        message: 'Your order has been prepared and is ready for pickup/delivery!',
        notifyCustomer: true
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      setSelectedOrder(null);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'ready': return <Package className="w-4 h-4 text-green-600" />;
      case 'picked_up': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedOrderData = orders?.find((o: Order) => o.id === selectedOrder);

  if (isLoading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="bg-[#F7F2EC] rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">Orders</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Order ID</th>
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Fulfillment</th>
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Total</th>
                <th className="text-left py-3 px-4 text-[#2C2C2C] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order: Order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-gray-200 hover:bg-white/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <td className="py-3 px-4 text-[#2C2C2C] font-mono text-sm">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 px-4 text-[#2C2C2C]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-[#2C2C2C]">
                    {order.fulfillments?.map((f, idx) => (
                      <div key={idx} className="text-sm">
                        {f.method} - {new Date(f.date).toLocaleDateString()}
                        {f.location && ` @ ${f.location.name}`}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#2C2C2C] font-semibold">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStatusMutation.mutate({ 
                          orderId: order.id, 
                          status: 'ready', 
                          message: 'Order ready for pickup' 
                        })}
                        className="px-3 py-1 bg-[#5B6E02] text-white rounded text-sm hover:bg-[#4A5A01] transition-colors"
                      >
                        Mark Ready
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ 
                          orderId: order.id, 
                          status: 'picked_up', 
                          message: 'Order picked up' 
                        })}
                        className="px-3 py-1 border border-[#5B6E02] text-[#5B6E02] rounded text-sm hover:bg-[#5B6E02] hover:text-white transition-colors"
                      >
                        Picked Up
                      </button>
                      <button
                        onClick={() => updateStatusMutation.mutate({ 
                          orderId: order.id, 
                          status: 'delivered', 
                          message: 'Order delivered' 
                        })}
                        className="px-3 py-1 border border-[#5B6E02] text-[#5B6E02] rounded text-sm hover:bg-[#5B6E02] hover:text-white transition-colors"
                      >
                        Delivered
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Breakdown Modal */}
      {selectedOrderData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F7F2EC] rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#F7F2EC] border-b border-gray-300 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">Order Details</h3>
                <p className="text-sm text-gray-600 mt-1">Order ID: {selectedOrderData.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold text-[#2C2C2C]">
                    {selectedOrderData.customerName || 'Customer'}
                  </p>
                  {selectedOrderData.customerEmail && (
                    <p className="text-sm text-gray-600">{selectedOrderData.customerEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-[#2C2C2C]">
                    {new Date(selectedOrderData.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedOrderData.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedOrderData.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrderData.status)}`}>
                      {selectedOrderData.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-xl text-[#2C2C2C]">
                    ${Number(selectedOrderData.total).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrderData.items && selectedOrderData.items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-3">Order Items</h4>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Product</th>
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Price</th>
                          <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderData.items.map((item: OrderItem) => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="py-3 px-4 text-[#2C2C2C]">{item.productName}</td>
                            <td className="py-3 px-4 text-[#2C2C2C]">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-[#2C2C2C]">${Number(item.price).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-semibold text-[#2C2C2C]">
                              ${(item.quantity * item.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Fulfillment Details */}
              {selectedOrderData.fulfillments && selectedOrderData.fulfillments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-3">Fulfillment Details</h4>
                  <div className="space-y-2">
                    {selectedOrderData.fulfillments.map((f: Fulfillment, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-4">
                        <p className="font-medium text-[#2C2C2C]">{f.method}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(f.date).toLocaleDateString()} at {new Date(f.date).toLocaleTimeString()}
                        </p>
                        {f.location && (
                          <p className="text-sm text-gray-600">Location: {f.location.name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Events */}
              {selectedOrderData.events && selectedOrderData.events.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#2C2C2C] mb-3">Order History</h4>
                  <div className="space-y-2">
                    {selectedOrderData.events.map((event: OrderEvent, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-3 flex items-start space-x-3">
                        <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2C2C2C]">{event.type}</p>
                          {event.message && (
                            <p className="text-sm text-gray-600">{event.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.createdAt).toLocaleDateString()} at{' '}
                            {new Date(event.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-[#F7F2EC] border-t border-gray-300 p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-white/50 rounded transition-colors"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  {selectedOrderData.status !== 'fulfilled' && selectedOrderData.status !== 'delivered' && (
                    <button
                      onClick={() => markFulfilledMutation.mutate({ orderId: selectedOrderData.id })}
                      disabled={markFulfilledMutation.isPending}
                      className="px-6 py-2 bg-[#5B6E02] text-white rounded font-semibold hover:bg-[#4A5A01] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Bell className="w-4 h-4" />
                      {markFulfilledMutation.isPending ? 'Processing...' : 'Mark Fulfilled & Notify Customer'}
                    </button>
                  )}
                  {selectedOrderData.status === 'fulfilled' && (
                    <span className="px-6 py-2 bg-purple-100 text-purple-800 rounded font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Order Fulfilled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
