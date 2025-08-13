import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpJson } from '@/lib/http';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';

interface Order {
  id: string;
  customerId: string;
  status: string;
  total: number;
  createdAt: string;
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
    queryFn: () => httpJson('/api/vendor/orders'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, message }: { orderId: string; status: string; message?: string }) =>
      httpJson(`/api/fulfillment/order/${orderId}/vendor/current/status`, {
        method: 'POST',
        body: JSON.stringify({ status, message })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Package className="w-4 h-4 text-green-600" />;
      case 'picked_up': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#F7F2EC] rounded-2xl shadow-xl p-6 border-2 border-[#5B6E02]">
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6">Orders</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#5B6E02]">
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
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
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
    </div>
  );
}
