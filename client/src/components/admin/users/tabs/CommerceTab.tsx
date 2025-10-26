import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Package, TrendingUp, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import Card from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';

interface CommerceTabProps {
  userId: string;
  roles: string[];
}

export default function CommerceTab({ userId, roles }: CommerceTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', userId, 'commerce'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/commerce`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch commerce data');
      return response.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F232E] mx-auto"></div>
      </div>
    );
  }
  
  const commerceData = data?.data || {};
  const isVendor = roles.includes('VENDOR');
  const isCustomer = roles.includes('CUSTOMER');
  
  return (
    <div className="space-y-6">
      {/* Customer Commerce */}
      {isCustomer && (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Customer Orders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {commerceData.customerStats?.totalOrders || 0}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(commerceData.customerStats?.totalSpent || 0).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Refunds</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {commerceData.customerStats?.refundCount || 0}
                </div>
              </div>
            </div>
            
            {/* Orders Timeline */}
            <div className="space-y-3">
              {commerceData.customerOrders && commerceData.customerOrders.slice(0, 10).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">Order #{order.id.slice(-8)}</div>
                    <div className="text-sm text-gray-500">
                      {order.vendor?.storeName} • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!commerceData.customerOrders || commerceData.customerOrders.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
      
      {/* Vendor Commerce */}
      {isVendor && commerceData.vendorStats && (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vendor Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">GMV</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(commerceData.vendorStats.gmv || 0).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">Orders</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {commerceData.vendorStats.orderCount || 0}
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Disputes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {commerceData.vendorStats.disputeCount || 0}
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Vendor Orders</h2>
            
            <div className="space-y-3">
              {commerceData.vendorOrders && commerceData.vendorOrders.slice(0, 10).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">Order #{order.id.slice(-8)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!commerceData.vendorOrders || commerceData.vendorOrders.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Quick Actions</h2>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Re-sync Stripe
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Recalculate Fees
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <FileText className="w-4 h-4 inline mr-2" />
                Resubmit Tax
              </button>
            </div>
          </Card>
        </>
      )}
      
      {!isVendor && !isCustomer && (
        <Card className="p-6 text-center py-12 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No commerce data available for this user role</p>
        </Card>
      )}
    </div>
  );
}

function getOrderStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
    case 'CONFIRMED':
    case 'PREPARING':
      return 'warning';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

