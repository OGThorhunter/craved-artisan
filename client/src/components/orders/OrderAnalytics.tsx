import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready_for_pickup' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  createdAt: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  productionStartDate?: string;
  productionEndDate?: string;
  assignedTo?: string;
  tags: string[];
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: 'pending' | 'in_production' | 'completed' | 'cancelled';
  }>;
}

interface OrderAnalyticsProps {
  orders: Order[];
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
}

const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({
  orders,
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'efficiency'>('revenue');

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return orders;
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  }, [orders, timeRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'delivered').length;
    const inProgressOrders = filteredOrders.filter(order => 
      ['confirmed', 'in_production', 'ready_for_pickup', 'shipped'].includes(order.status)
    ).length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled').length;
    
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate average production time
    const completedWithProduction = filteredOrders.filter(order => 
      order.status === 'delivered' && order.productionStartDate && order.productionEndDate
    );
    const averageProductionTime = completedWithProduction.length > 0 
      ? completedWithProduction.reduce((sum, order) => {
          const start = new Date(order.productionStartDate!);
          const end = new Date(order.productionEndDate!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedWithProduction.length
      : 0;

    // Calculate on-time delivery rate
    const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered');
    const onTimeDeliveries = deliveredOrders.filter(order => {
      if (!order.actualDeliveryDate) return false;
      const actual = new Date(order.actualDeliveryDate);
      const expected = new Date(order.expectedDeliveryDate);
      return actual <= expected;
    }).length;
    const onTimeRate = deliveredOrders.length > 0 ? (onTimeDeliveries / deliveredOrders.length) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      inProgressOrders,
      cancelledOrders,
      completionRate,
      averageOrderValue,
      averageProductionTime: Math.round(averageProductionTime),
      onTimeRate
    };
  }, [filteredOrders]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
      percentage: (count / filteredOrders.length) * 100,
    }));
  }, [filteredOrders]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const distribution = filteredOrders.reduce((acc, order) => {
      acc[order.priority] = (acc[order.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      percentage: (count / filteredOrders.length) * 100,
    }));
  }, [filteredOrders]);

  // Monthly trends
  const monthlyTrends = useMemo(() => {
    const monthlyData: Record<string, { revenue: number; orders: number }> = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, orders: 0 };
      }
      
      monthlyData[monthKey].revenue += order.totalAmount;
      monthlyData[monthKey].orders += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders
      }));
  }, [filteredOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in production': 'bg-orange-100 text-orange-800',
      'ready for pickup': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-gray-100 text-gray-800',
      'Medium': 'bg-blue-100 text-blue-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Analytics</h2>
          <p className="text-gray-600">Track performance and identify trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            title="Select time range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-medium text-gray-900">{metrics.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-gray-900">{metrics.inProgressOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-sm font-medium text-gray-900">{metrics.cancelledOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Efficiency Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Production Time</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.averageProductionTime} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On-Time Delivery</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.onTimeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-2">
            {statusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-sm text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {priorityDistribution.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-[#F7F2EC] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-3">
            {monthlyTrends.slice(-6).map((trend) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">{trend.orders} orders</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(trend.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;

